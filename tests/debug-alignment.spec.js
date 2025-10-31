const { test, expect } = require('@playwright/test');

test('调试坐标定位', async ({ page }) => {
  await page.goto('http://localhost:8080');
  await page.click('.mode-btn[data-mode="10+0"]');
  await page.click('#start-game-btn');
  await page.waitForSelector('#game-board');

  // 获取所有关键元素的位置
  const debug = await page.evaluate(() => {
    const canvas = document.getElementById('game-board');
    const boardWrapper = canvas.parentElement;
    const boardCoordinates = boardWrapper.querySelector('.board-coordinates');
    const rankLabels = boardCoordinates.querySelector('.rank-labels');
    const fileLabels = boardCoordinates.querySelector('.file-labels');

    const canvasRect = canvas.getBoundingClientRect();
    const wrapperRect = boardWrapper.getBoundingClientRect();
    const coordRect = boardCoordinates.getBoundingClientRect();
    const rankRect = rankLabels.getBoundingClientRect();
    const fileRect = fileLabels.getBoundingClientRect();

    // 获取计算样式
    const rankStyle = window.getComputedStyle(rankLabels);
    const fileStyle = window.getComputedStyle(fileLabels);
    const coordStyle = window.getComputedStyle(boardCoordinates);
    const wrapperStyle = window.getComputedStyle(boardWrapper);

    return {
      canvas: {
        x: canvasRect.x,
        y: canvasRect.y,
        width: canvasRect.width,
        height: canvasRect.height
      },
      wrapper: {
        x: wrapperRect.x,
        y: wrapperRect.y,
        padding: wrapperStyle.padding
      },
      coordinates: {
        x: coordRect.x,
        y: coordRect.y,
        position: coordStyle.position,
        top: coordStyle.top,
        left: coordStyle.left
      },
      rankLabels: {
        x: rankRect.x,
        y: rankRect.y,
        height: rankRect.height,
        position: rankStyle.position,
        top: rankStyle.top,
        left: rankStyle.left
      },
      fileLabels: {
        x: fileRect.x,
        y: fileRect.y,
        position: fileStyle.position,
        bottom: fileStyle.bottom,
        left: fileStyle.left
      }
    };
  });

  console.log('调试信息:');
  console.log(JSON.stringify(debug, null, 2));

  // 截图
  await page.screenshot({ path: 'test-results/debug-screenshot.png', fullPage: true });
});
