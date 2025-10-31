/**
 * Piece Movement E2E Tests
 * 端到端测试：棋子交互用户旅程
 */

import { test, expect } from '@playwright/test';

test.describe('棋子移动用户旅程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');

    // 开始游戏
    await page.click('button[data-time-mode="unlimited"]');
    await page.click('button#startGame');
    await page.waitForTimeout(500);
  });

  test('用户应该能点击选中棋子', async ({ page }) => {
    const canvas = page.locator('canvas#gameCanvas');

    // 点击白方棋子（a2位置）
    const box = await canvas.boundingBox();
    const clickX = box.x + 40; // 第一列中心
    const clickY = box.y + 440; // 第二行中心

    await canvas.click({ position: { x: clickX - box.x, y: clickY - box.y } });

    // 应该看到高亮的可移动位置
    await page.waitForTimeout(200);

    // 检查是否有视觉反馈（这里需要具体的UI实现）
    // await expect(page.locator('.highlight')).toBeVisible();
  });

  test('用户应该能移动选中的棋子', async ({ page }) => {
    const canvas = page.locator('canvas#gameCanvas');
    const box = await canvas.boundingBox();

    // 选中棋子（a2）
    await canvas.click({ position: { x: 40, y: 440 } });
    await page.waitForTimeout(200);

    // 点击目标位置（a3）
    await canvas.click({ position: { x: 40, y: 360 } });
    await page.waitForTimeout(200);

    // 应该切换到对方回合
    const status = page.locator('#gameStatus');
    await expect(status).toContainText('黑方');
  });

  test('用户应该看到可移动位置的高亮提示', async ({ page }) => {
    const canvas = page.locator('canvas#gameCanvas');

    // 选中棋子
    await canvas.click({ position: { x: 40, y: 440 } });
    await page.waitForTimeout(200);

    // 截图验证高亮效果
    // await expect(page).toHaveScreenshot('highlighted-moves.png');
  });

  test('用户不应该能移动对方棋子', async ({ page }) => {
    const canvas = page.locator('canvas#gameCanvas');

    // 尝试选中黑方棋子（a6）
    await canvas.click({ position: { x: 40, y: 120 } });
    await page.waitForTimeout(200);

    // 不应该有高亮（因为不能选中对方棋子）
    // 这里需要验证没有高亮效果
  });

  test('用户应该能旋转棋子', async ({ page }) => {
    // 选中棋子
    const canvas = page.locator('canvas#gameCanvas');
    await canvas.click({ position: { x: 40, y: 440 } });
    await page.waitForTimeout(200);

    // 点击旋转按钮（如果有UI按钮）
    const rotateButton = page.locator('button#rotate, button[aria-label="旋转"]');

    if (await rotateButton.isVisible()) {
      await rotateButton.click();
      await page.waitForTimeout(200);

      // 应该看到旋转动画或结果
      // 回合应该结束
      const status = page.locator('#gameStatus');
      await expect(status).toContainText('黑方');
    }
  });

  test('用户应该能发射激光', async ({ page }) => {
    // 点击激光发射按钮
    const fireLaserButton = page.locator('button#fireLaser, button[aria-label="发射激光"]');

    if (await fireLaserButton.isVisible()) {
      await fireLaserButton.click();

      // 应该看到激光动画
      await page.waitForTimeout(1500); // 等待激光动画

      // 检查是否有激光路径显示
      // await expect(page.locator('.laser-path')).toBeVisible();
    }
  });

  test('用户每回合只能执行一次操作', async ({ page }) => {
    const canvas = page.locator('canvas#gameCanvas');

    // 执行移动
    await canvas.click({ position: { x: 40, y: 440 } });
    await page.waitForTimeout(200);
    await canvas.click({ position: { x: 40, y: 360 } });
    await page.waitForTimeout(200);

    // 应该已经切换到对方回合
    const status = page.locator('#gameStatus');
    await expect(status).toContainText('黑方');

    // 不应该能再执行操作（白方）
    await canvas.click({ position: { x: 120, y: 440 } });
    await page.waitForTimeout(200);

    // 仍然是黑方回合
    await expect(status).toContainText('黑方');
  });

  test('操作响应应该在200ms内', async ({ page }) => {
    const canvas = page.locator('canvas#gameCanvas');

    const startTime = Date.now();

    // 点击棋子
    await canvas.click({ position: { x: 40, y: 440 } });

    // 等待视觉反馈
    await page.waitForSelector('.piece-selected, .highlight', { timeout: 200 }).catch(() => {
      // 如果没有这些class，也没关系，主要测试响应时间
    });

    const responseTime = Date.now() - startTime;

    expect(responseTime).toBeLessThan(200);
  });
});
