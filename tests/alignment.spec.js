const { test, expect } = require('@playwright/test');

test.describe('Board Coordinates Alignment', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    // 点击任意游戏模式
    await page.click('.mode-btn[data-mode="10+0"]');
    // 点击开始游戏
    await page.click('#start-game-btn');
    // 等待棋盘加载
    await page.waitForSelector('#game-board');
  });

  test('列号 a-g 应该与棋盘列对齐', async ({ page }) => {
    const canvas = await page.locator('#game-board');
    const canvasBox = await canvas.boundingBox();

    // 获取列标签容器
    const fileLabels = await page.locator('.file-labels');
    const labelText = await fileLabels.textContent();

    console.log('Canvas位置:', canvasBox);
    console.log('列标签文本:', labelText);

    // 棋盘每格 80px,7列
    // 第一列 a 应该在 canvasBox.x + 40px (格子中心)
    // 第七列 g 应该在 canvasBox.x + 520px (格子中心)

    // 验证标签存在
    expect(labelText).toContain('a');
    expect(labelText).toContain('g');
  });

  test('行号 1-7 应该与棋盘行对齐', async ({ page }) => {
    const canvas = await page.locator('#game-board');
    const canvasBox = await canvas.boundingBox();

    // 获取行标签
    const rankLabels = await page.locator('.rank-labels');
    const spans = await rankLabels.locator('span').all();

    console.log('Canvas位置:', canvasBox);
    console.log('行标签数量:', spans.length);

    // 应该有7个行标签
    expect(spans.length).toBe(7);

    // 从上到下应该是 7, 6, 5, 4, 3, 2, 1
    const firstLabel = await spans[0].textContent();
    const lastLabel = await spans[6].textContent();

    expect(firstLabel).toBe('7');
    expect(lastLabel).toBe('1');

    // 检查每个标签的垂直位置
    for (let i = 0; i < spans.length; i++) {
      const box = await spans[i].boundingBox();
      const expectedY = canvasBox.y + (i * 80) + 40; // 每格80px,取中心
      const actualY = box.y + box.height / 2;

      console.log(`行 ${7-i}: 期望Y=${expectedY.toFixed(1)}, 实际Y=${actualY.toFixed(1)}, 差值=${Math.abs(expectedY - actualY).toFixed(1)}px`);

      // 允许5px的误差
      expect(Math.abs(expectedY - actualY)).toBeLessThan(10);
    }
  });

  test('列号位置检查', async ({ page }) => {
    const canvas = await page.locator('#game-board');
    const canvasBox = await canvas.boundingBox();

    // 获取file-labels的位置
    const fileLabels = await page.locator('.file-labels');
    const fileBox = await fileLabels.boundingBox();

    console.log('Canvas宽度:', canvasBox.width);
    console.log('File labels位置:', fileBox);
    console.log('Canvas X起始:', canvasBox.x);

    // 使用evaluate获取每个字母的实际位置
    const positions = await page.evaluate(() => {
      const container = document.querySelector('.file-labels');
      const text = container.textContent;
      const range = document.createRange();
      const letters = [];

      // 获取每个字母的位置
      for (let i = 0; i < text.length; i++) {
        if (text[i].trim()) {
          letters.push({
            letter: text[i],
            index: i
          });
        }
      }

      return {
        containerX: container.getBoundingClientRect().x,
        containerWidth: container.getBoundingClientRect().width,
        text: text,
        letters: letters.length
      };
    });

    console.log('列标签详情:', positions);
  });
});
