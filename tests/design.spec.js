import {test,expect} from '@playwright/test';

test('landing and workspace stay readable across compact and tablet widths',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const width of [320,390,768,1024]){
    await page.setViewportSize({width,height:900});
    await page.goto('/');
    await page.evaluate(()=>document.fonts.ready);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`home at ${width}`).toBe(true);
    if(width===390)await page.screenshot({path:'test-results/clay-home-mobile.png',fullPage:true});
    await page.getByRole('button',{name:'Explorar demonstração',exact:true}).click();
    for(const route of ['painel','perfil','universidades','lista','essays','sat','candidaturas','assistentes','documentos']){
      await page.goto('/#'+route);
      await expect(page.locator('main')).toHaveAttribute('data-page',route);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${route} at ${width}`).toBe(true);
    }
    await page.evaluate(()=>sessionStorage.removeItem('mc-demo'));
  }
  expect(await page.locator('.ambient i').first().evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
});

test('mobile menu closes even when selecting the current page',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await page.getByRole('button',{name:'Explorar demonstração',exact:true}).click();
  await page.getByRole('button',{name:'Mais opções'}).click();
  await page.locator('.sidebar').getByRole('link',{name:'Meu caminho',exact:true}).click();
  await expect(page.locator('.sidebar')).not.toBeVisible();
  await expect(page.locator('main')).toHaveAttribute('data-page','painel');
});
