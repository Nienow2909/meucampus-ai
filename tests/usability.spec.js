import {test,expect} from '@playwright/test';

async function demo(page){
  await page.goto('/');
  await page.getByRole('button',{name:'Explorar demonstração',exact:true}).click();
}

test('busca preserva o campo e permite limpar filtros e ordenar',async({page})=>{
  await demo(page);
  await page.getByRole('link',{name:'Universidades',exact:true}).click();
  const search=page.getByLabel('Buscar universidade ou curso');
  const input=await search.elementHandle();
  await search.pressSequentially('Aurora');
  await expect(page.locator('.university-card')).toHaveCount(1);
  expect(await input.evaluate(el=>el===document.activeElement&&el.isConnected)).toBe(true);
  await page.getByRole('button',{name:'Limpar filtros'}).click();
  await expect(search).toHaveValue('');
  await page.getByLabel('Ordenar por').selectOption('name');
  await expect(page.locator('.university-card h3').first()).toHaveText('Universidade Arco');
});

test('perfil e essay não perdem rascunhos ao trocar de tela',async({page})=>{
  await demo(page);
  await page.getByRole('link',{name:'Meu perfil',exact:true}).click();
  await page.getByLabel('Nome *',{exact:true}).fill('Lia Rascunho');
  await page.getByRole('link',{name:'Essays',exact:true}).click();
  await page.getByRole('button',{name:'Novo essay'}).click();
  await page.getByLabel('Seu texto',{exact:true}).fill('Meu rascunho ainda não foi salvo.');
  await page.getByRole('link',{name:'Meu perfil',exact:true}).click();
  await expect(page.getByLabel('Nome *',{exact:true})).toHaveValue('Lia Rascunho');
  await page.getByRole('link',{name:'Essays',exact:true}).click();
  await expect(page.getByLabel('Seu texto',{exact:true})).toHaveValue('Meu rascunho ainda não foi salvo.');
  await expect(page.locator('#word-count')).toContainText('6 / 650');
  await page.getByRole('button',{name:'Salvar rascunho',exact:true}).click();
  await expect(page.getByRole('status')).toHaveText('Rascunho salvo.');
});

test('menu móvel abre, navega e fecha sem ocultar o conteúdo',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await demo(page);
  await expect(page.locator('.sidebar')).not.toBeVisible();
  await page.getByRole('button',{name:'Mais opções'}).click();
  await expect(page.locator('.sidebar')).toBeVisible();
  await page.locator('.sidebar').getByRole('link',{name:'Essays',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Ideias que merecem espaço.'})).toBeVisible();
  await expect(page.locator('.sidebar')).not.toBeVisible();
  await page.getByRole('button',{name:'Abrir menu',exact:true}).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button',{name:'Abrir menu',exact:true})).toBeFocused();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('fechar uma ficha durante o carregamento descarta a resposta atrasada',async({page})=>{
  let resolveDetail;
  const delayed=new Promise(resolve=>resolveDetail=resolve);
  await page.route('**/rest/v1/universities?*',async route=>{
    if(new URL(route.request().url()).searchParams.has('id')){
      await delayed;
      await route.fulfill({json:{summary:'Ficha carregada.',requirements:{},guidance:{},details:{},university_sources:[]}});
    }else await route.fulfill({json:[{id:'fixture',name:'Universidade de teste',country:'Canadá',courses:['Computação'],cycle:'Teste'}]});
  });
  await page.goto('/#universidades');
  await page.getByRole('button',{name:'Explorar e escolher'}).click();
  await expect(page.getByRole('dialog')).toContainText('Carregando universidade.');
  await page.getByRole('button',{name:'Fechar',exact:true}).click();
  resolveDetail();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button',{name:'Explorar e escolher'}).click();
  await expect(page.getByRole('dialog')).toContainText('Ficha carregada.');
});
