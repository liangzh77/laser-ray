/**
 * Game Start E2E Tests
 * 端到端测试：游戏初始化用户旅程
 */

import { test, expect } from '@playwright/test';

test.describe('游戏初始化用户旅程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('用户应该能看到游戏界面', async ({ page }) => {
    // 等待Canvas元素加载
    const canvas = page.locator('canvas#gameCanvas');
    await expect(canvas).toBeVisible();

    // 检查Canvas尺寸
    const box = await canvas.boundingBox();
    expect(box.width).toBe(560); // 7 * 80
    expect(box.height).toBe(560);
  });

  test('用户应该能看到初始棋盘布局', async ({ page }) => {
    const canvas = page.locator('canvas#gameCanvas');
    await expect(canvas).toBeVisible();

    // 等待渲染完成
    await page.waitForTimeout(500);

    // 截图验证（如果需要）
    // await expect(page).toHaveScreenshot('initial-board.png');
  });

  test('用户应该能看到时间模式选择', async ({ page }) => {
    // 查找时间模式按钮
    const timeModeButtons = page.locator('button[data-time-mode]');
    const count = await timeModeButtons.count();

    expect(count).toBeGreaterThanOrEqual(3); // 至少3个时间模式
  });

  test('用户应该能选择时间模式并开始游戏', async ({ page }) => {
    // 选择10+0模式
    await page.click('button[data-time-mode="10+0"]');

    // 点击开始游戏按钮
    await page.click('button#startGame');

    // 等待游戏开始
    await page.waitForTimeout(500);

    // 检查游戏状态显示
    const statusText = page.locator('#gameStatus');
    await expect(statusText).toContainText('白方的回合');
  });

  test('用户应该能看到当前回合玩家提示', async ({ page }) => {
    // 开始游戏
    await page.click('button[data-time-mode="unlimited"]');
    await page.click('button#startGame');

    // 检查当前玩家显示
    const currentPlayer = page.locator('#currentPlayer');
    await expect(currentPlayer).toContainText('白方');
  });

  test('用户应该能看到计时器（如果不是无限时间）', async ({ page }) => {
    // 选择10+0模式
    await page.click('button[data-time-mode="10+0"]');
    await page.click('button#startGame');

    // 检查计时器显示
    const whiteTimer = page.locator('#whiteTimer');
    const blackTimer = page.locator('#blackTimer');

    await expect(whiteTimer).toBeVisible();
    await expect(blackTimer).toBeVisible();
    await expect(whiteTimer).toContainText('10:00');
    await expect(blackTimer).toContainText('10:00');
  });

  test('用户界面应该在3秒内加载完成', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('http://localhost:3000');
    await page.locator('canvas#gameCanvas').waitFor();

    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000);
  });

  test('用户应该能快速理解基础操作', async ({ page }) => {
    // 检查是否有帮助/说明按钮
    const helpButton = page.locator('button#help, button[aria-label="帮助"]');

    if (await helpButton.isVisible()) {
      await helpButton.click();

      // 应该显示帮助对话框
      const helpDialog = page.locator('[role="dialog"], .help-modal');
      await expect(helpDialog).toBeVisible();
    }
  });
});
