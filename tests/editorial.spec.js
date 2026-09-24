import {test,expect} from '@playwright/test';
import {articles} from '../src/content/articles.js';

test.beforeEach(async({page})=>{
  await page.route('**/rest/v1/**',route=>route.fulfill({json:[]}));
});

test('public navigation opens about, blog, articles and FAQ without signing in',async({page})=>{
  await page.goto('/');
  await page.getByRole('navigation',{name:'Navegação principal',exact:true}).getByRole('link',{name:'Quem somos'}).click();
  await expect(page.locator('main')).toHaveAttribute('data-page','quem-somos');
  await expect(page.getByRole('heading',{level:1})).toContainText('Um lugar para organizar');
  await page.getByRole('navigation',{name:'Navegação principal',exact:true}).getByRole('link',{name:'Blog',exact:true}).click();
  for(const a of articles){
    await page.getByRole('link',{name:'Ler: '+a.title,exact:true}).click();
    await expect(page.getByRole('heading',{level:1})).toHaveText(a.title);
    await expect(page).toHaveTitle(a.title+' | MeuCampus');
    await expect(page.locator('.article-sources a')).toHaveAttribute('href',a.sources[0][1]);
    await page.reload();
    await expect(page.getByRole('heading',{level:1})).toHaveText(a.title);
    await page.getByRole('link',{name:'← Voltar ao blog'}).click();
  }
  await page.getByRole('link',{name:'Perguntas frequentes',exact:true}).click();
  const question=page.locator('summary').filter({hasText:'Os assistentes de IA já estão disponíveis?'});
  await question.focus();await page.keyboard.press('Enter');
  await expect(page.locator('details[open]')).toContainText('está em preparação');
});

test('an article can start the corresponding demo tool without an AI request',async({page})=>{
  let calls=0;page.on('request',r=>{if(r.url().includes('/functions/v1/'))calls++;});
  await page.goto('/#blog/primeiro-rascunho-do-essay');
  await page.getByRole('button',{name:'Começar um rascunho'}).click();
  await expect(page.locator('main')).toHaveAttribute('data-page','essays');
  await expect(page.locator('.demo-banner')).toBeVisible();
  expect(calls).toBe(0);
});

test('editorial pages fit mobile and desktop and preserve visible navigation',async({page})=>{
  for(const width of [320,390,768,1440]){
    await page.setViewportSize({width,height:1000});
    for(const route of ['quem-somos','blog','blog/rotina-de-estudo-sat','duvidas']){
      await page.goto('/#'+route);
      await expect(page.getByRole('heading',{level:1})).toBeVisible();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
      await expect(page.getByRole('navigation',{name:'Navegação principal',exact:true}).getByRole('link',{name:'Blog',exact:true})).toBeVisible();
    }
  }
  await page.goto('/#quem-somos');
  await page.screenshot({path:'test-results/about-desktop.png',fullPage:true});
  await page.goto('/#blog');
  await page.screenshot({path:'test-results/blog-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:'test-results/blog-mobile.png',fullPage:true});
});
