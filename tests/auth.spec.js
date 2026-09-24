import {test,expect} from '@playwright/test';

test.beforeEach(async({page})=>{
  await page.route('**/rest/v1/**',route=>route.fulfill({json:[]}));
});

test('recovery requests the correct redirect without revealing account existence',async({page})=>{
  let request;
  await page.route('**/auth/v1/recover?*',route=>{request=route.request();return route.fulfill({json:{}});});
  await page.goto('/#entrar');
  await page.getByRole('link',{name:'Esqueci minha senha'}).click();
  await page.getByLabel('E-mail da sua conta').fill('aluno@example.com');
  await page.getByRole('button',{name:'Enviar link de recuperação'}).click();
  await expect(page.locator('#recovery-result')).toContainText('Se este e-mail estiver cadastrado');
  expect(request.postDataJSON().email).toBe('aluno@example.com');
  expect(new URL(request.url()).searchParams.get('redirect_to')).toBe('http://127.0.0.1:5173/?flow=recovery');
});

test('late catalog response preserves the email and password already entered',async({page})=>{
  let release,requested;
  const pending=new Promise(resolve=>release=resolve);
  const started=new Promise(resolve=>requested=resolve);
  await page.route('**/rest/v1/universities?*',async route=>{
    requested();await pending;await route.fulfill({json:[]});
  });
  await page.goto('/#entrar');await started;
  const email=page.getByLabel('E-mail',{exact:true});
  await email.fill('aluno@example.com');
  await page.getByLabel('Senha',{exact:true}).fill('senha-teste-123');
  await email.focus();
  const response=page.waitForResponse('**/rest/v1/universities?*');
  release();await response;
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await expect(email).toHaveValue('aluno@example.com');
  await expect(email).toBeFocused();
  await expect(page.getByLabel('Senha',{exact:true})).toHaveValue('senha-teste-123');
});

test('signing into an account discards unsaved demo profile drafts',async({page})=>{
  const user={id:'22222222-2222-4222-8222-222222222222',aud:'authenticated',role:'authenticated',email:'conta@example.com',app_metadata:{},user_metadata:{}};
  await page.route('**/auth/v1/token?*',route=>route.fulfill({json:{user,access_token:'test-token',refresh_token:'test-refresh',token_type:'bearer',expires_in:3600}}));
  await page.route('**/rest/v1/student_profiles?*',route=>route.fulfill({json:{user_id:user.id,full_name:'Perfil da conta',school_year:'3º ano',interest:'Design'}}));
  await page.goto('/');
  await page.getByRole('button',{name:'Explorar demonstração',exact:true}).click();
  await page.getByRole('link',{name:'Meu perfil',exact:true}).click();
  await page.getByLabel('Nome *',{exact:true}).fill('Rascunho da demonstração');
  await page.evaluate(()=>location.hash='entrar');
  await page.getByLabel('E-mail',{exact:true}).fill(user.email);
  await page.getByLabel('Senha',{exact:true}).fill('senha-teste-123');
  await page.getByRole('button',{name:'Entrar →',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Olá, Perfil'})).toBeVisible();
  await page.getByRole('link',{name:'Meu perfil',exact:true}).click();
  await expect(page.getByLabel('Nome *',{exact:true})).toHaveValue('Perfil da conta');
  await expect(page.locator('.demo-banner')).toHaveCount(0);
});

test('expired recovery link never exposes a password update form',async({page})=>{
  await page.goto('/?flow=recovery#nova-senha');
  await expect(page.getByRole('heading',{name:'Solicite um novo link'})).toBeVisible();
  await expect(page.locator('#reset-form')).toHaveCount(0);
});

test('recovery callback validates matching passwords and updates the authenticated user',async({page})=>{
  const user={id:'11111111-1111-4111-8111-111111111111',aud:'authenticated',role:'authenticated',email:'aluno@example.com',app_metadata:{},user_metadata:{},created_at:new Date().toISOString()};
  let updated=null;
  await page.route('**/auth/v1/user',route=>{
    if(route.request().method()==='PUT')updated=route.request().postDataJSON();
    return route.fulfill({json:user});
  });
  const encode=x=>Buffer.from(JSON.stringify(x)).toString('base64url');
  const token=encode({alg:'HS256',typ:'JWT'})+'.'+encode({sub:user.id,exp:Math.floor(Date.now()/1000)+3600})+'.test';
  await page.goto('/?flow=recovery#access_token='+token+'&refresh_token=test-refresh&token_type=bearer&expires_in=3600&type=recovery');
  await expect(page.getByRole('heading',{name:'Crie sua nova senha'})).toBeVisible();
  await page.getByLabel('Nova senha',{exact:true}).fill('senha-teste-123');
  await page.getByLabel('Repita a nova senha').fill('senha-diferente');
  await page.getByRole('button',{name:'Salvar nova senha'}).click();
  await expect(page.locator('#notice')).toHaveText('As senhas precisam ser iguais.');
  expect(updated).toBeNull();
  await page.getByLabel('Repita a nova senha').fill('senha-teste-123');
  await page.getByRole('button',{name:'Salvar nova senha'}).click();
  await expect(page.locator('#notice')).toContainText('Senha atualizada');
  expect(updated.password).toBe('senha-teste-123');
  expect(page.url()).not.toContain('access_token');
});
