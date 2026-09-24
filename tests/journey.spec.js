import {test,expect} from '@playwright/test';
test('jornada internacional: perfil, lista 3/4/5, essay, tarefa e SAT',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');
 await page.getByRole('button',{name:'Explorar demonstração',exact:true}).click();
 await expect(page.getByRole('heading',{name:/Olá/})).toBeVisible();
 await page.getByRole('link',{name:'Meu perfil',exact:true}).click();
 await page.getByLabel('Nome *',{exact:true}).fill('Ana Teste');
 await page.getByLabel('Ano ou etapa escolar').fill('2º ano');
 await page.getByLabel('Curso ou área de interesse').fill('Computação');
 await page.getByLabel('Média escolar').fill('8.5');
 await page.getByLabel('Nota máxima da escala').fill('10');
 await page.getByLabel('SAT realizado',{exact:true}).fill('1250');
 await page.getByLabel('Meta de SAT',{exact:true}).fill('1450');
 await page.getByRole('button',{name:'Salvar meu perfil'}).click();
 await expect(page.getByRole('heading',{name:'Olá, Ana'})).toBeVisible();
 await page.getByRole('link',{name:'Universidades',exact:true}).click();
 for(let i=0;i<12;i++){
  await page.getByRole('button',{name:'Explorar e escolher'}).nth(i).click();
  await page.getByLabel('Adicionar em').selectOption(i<3?'dream':i<7?'target':'likely');
  await page.getByRole('button',{name:'Adicionar à minha lista'}).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
 }
 await page.getByRole('link',{name:/Minha lista/}).first().click();
 await expect(page.locator('.list-item')).toHaveCount(12);
 await page.reload();
 await expect(page.locator('.list-item')).toHaveCount(12);
 await page.getByRole('link',{name:'Essays',exact:true}).click();
 await page.getByRole('button',{name:'Novo essay'}).click();
 await page.getByLabel('Seu texto',{exact:true}).fill('Minha história começa com um projeto real.');
 await page.getByRole('button',{name:'Salvar rascunho',exact:true}).click();
 await expect(page.getByRole('status')).toHaveText('Rascunho salvo.');
 await page.getByRole('link',{name:'Candidaturas',exact:true}).click();
 await page.getByLabel('O que precisa ser feito?').fill('Solicitar histórico');
 await page.getByRole('button',{name:'Adicionar ao meu plano'}).click();
 await page.getByRole('checkbox',{name:'Solicitar histórico'}).check();
 await expect(page.locator('.completed')).toContainText('Solicitar histórico');
 await page.getByRole('link',{name:'Estudar SAT',exact:true}).click();
 await page.locator('input[name=answer][value="1"]').check();
 await page.getByRole('button',{name:'Conferir resposta'}).click();
 await expect(page.getByText('Você acertou.',{exact:true})).toBeVisible();
 await page.getByRole('link',{name:'Assistentes',exact:true}).click();
 await page.getByLabel('Sua pergunta').fill('Quais universidades combinam comigo?');
 await page.getByRole('button',{name:'Enviar ↗',exact:true}).click();
 await expect(page.getByRole('status')).toContainText('Entre em uma conta conectada');
 expect(errors).toEqual([]);
});
test('impede avançar antes das três escolhas sonho e escapa texto do aluno',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Explorar demonstração',exact:true}).click();
 await page.getByRole('link',{name:'Universidades',exact:true}).click();
 await page.getByRole('button',{name:'Explorar e escolher'}).first().click();
 await page.getByLabel('Adicionar em').selectOption('target');
 await page.getByRole('button',{name:'Adicionar à minha lista'}).click();
 await expect(page.getByRole('alert')).toHaveText('Complete os grupos anteriores primeiro.');
 await page.getByRole('button',{name:'Fechar',exact:true}).click();
 await page.getByRole('link',{name:'Meu perfil',exact:true}).click();
 await page.getByLabel('Nome *',{exact:true}).fill('<img src=x onerror=alert(1)>');
 await page.getByLabel('Ano ou etapa escolar').fill('2º ano');
 await page.getByLabel('Curso ou área de interesse').fill('Ciência');
 await page.getByRole('button',{name:'Salvar meu perfil'}).click();
 expect(await page.locator('img').count()).toBe(0);
});
test('telas não transbordam no celular',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');await page.screenshot({path:'test-results/home-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'Explorar demonstração',exact:true}).click();
 for(const route of ['painel','perfil','universidades','lista','essays','sat','candidaturas','assistentes','documentos']){
  await page.goto('/#'+route);await page.waitForTimeout(100);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),route).toBe(true);
 }
 await page.goto('/#painel');await page.screenshot({path:'test-results/dashboard-mobile.png',fullPage:true});
});
test('landing e painel em desktop',async({page})=>{
 await page.goto('/');await page.screenshot({path:'test-results/home-desktop.png',fullPage:true});
 await page.getByRole('button',{name:'Explorar demonstração',exact:true}).click();
 await page.screenshot({path:'test-results/dashboard-desktop.png',fullPage:true});
});
