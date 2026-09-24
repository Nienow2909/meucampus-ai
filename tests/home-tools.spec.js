import {test,expect} from '@playwright/test';

test('home tool cards open the selected demo workspace without registration',async({page})=>{
  await page.route('**/rest/v1/**',route=>route.fulfill({json:[]}));
  let paidCalls=0;page.on('request',request=>{if(request.url().includes('/functions/v1/counselor'))paidCalls++;});
  for(const [label,route] of [['Abrir espaço de escrita','essays'],['Experimentar uma questão','sat'],['Conhecer meu plano','candidaturas']]){
    await page.goto('/');
    await page.evaluate(()=>{sessionStorage.clear();localStorage.clear();});
    await page.reload();
    await page.getByRole('button',{name:label}).click();
    await expect(page.locator('main')).toHaveAttribute('data-page',route);
    await expect(page.locator('.demo-banner')).toContainText('demonstração');
  }
  expect(paidCalls).toBe(0);
});

test('returning to a tool from the home page keeps an existing draft',async({page})=>{
  await page.route('**/rest/v1/**',route=>route.fulfill({json:[]}));
  await page.goto('/');
  await page.getByRole('button',{name:'Abrir espaço de escrita'}).click();
  await page.getByRole('button',{name:'Novo essay'}).click();
  await page.getByLabel('Seu texto',{exact:true}).fill('Um rascunho que deve continuar aqui.');
  await page.getByRole('link',{name:'MeuCampus, início'}).click();
  await page.getByRole('link',{name:'Abrir espaço de escrita'}).click();
  await expect(page.getByLabel('Seu texto',{exact:true})).toHaveValue('Um rascunho que deve continuar aqui.');
});
