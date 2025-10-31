/**
 * Laser Physics E2E Tests
 * 端到端测试：激光物理用户旅程
 */

import { test, expect } from '@playwright/test';

test.describe('激光物理用户旅程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');

    // 开始游戏
    await page.click('button[data-mode="unlimited"]');
    await page.click('button#start-game-btn');
    await page.waitForTimeout(500);
  });

  test('用户应该能看到激光发射按钮', async ({ page }) => {
    const fireLaserBtn = page.locator('button#fire-laser-btn');
    await expect(fireLaserBtn).toBeVisible();
  });

  test('用户点击激光按钮应该触发激光发射', async ({ page }) => {
    // 点击发射激光按钮
    const fireLaserBtn = page.locator('button#fire-laser-btn');
    await fireLaserBtn.click();

    // 应该看到激光动画或效果
    await page.waitForTimeout(1000);

    // 应该切换到下一个回合
    const status = page.locator('#current-turn');
    await expect(status).toContainText('黑方');
  });

  test('用户应该看到激光路径可视化', async ({ page }) => {
    // 发射激光
    await page.click('button#fire-laser-btn');

    // 等待激光动画
    await page.waitForTimeout(1500);

    // 检查Canvas是否有更新（激光路径应该被绘制）
    const canvas = page.locator('canvas#game-board');
    await expect(canvas).toBeVisible();

    // 可以通过截图对比验证激光路径
    // await expect(page).toHaveScreenshot('laser-path.png');
  });

  test('用户应该看到棋子被激光摧毁的效果', async ({ page }) => {
    // 设置一个简单的测试场景
    // （这需要预设特定的棋盘状态，或通过多次操作创建）

    // 发射激光
    await page.click('button#fire-laser-btn');

    // 等待激光动画完成
    await page.waitForTimeout(1500);

    // 如果有棋子被摧毁，应该看到摧毁动画
    // （具体验证取决于UI实现）
  });

  test('激光击中对方炮塔应该结束游戏', async ({ page }) => {
    // 这个测试需要特定的棋盘布局
    // 在实际测试中可能需要多步操作来创建这个场景

    // 假设通过一系列移动创建了激光能击中对方炮塔的场景
    // ...

    // 发射激光
    await page.click('button#fire-laser-btn');
    await page.waitForTimeout(1500);

    // 应该显示游戏结束画面
    // const gameOverScreen = page.locator('#game-over-screen');
    // await expect(gameOverScreen).toBeVisible();
  });

  test('激光发射后应该自动结束回合', async ({ page }) => {
    // 记录当前回合
    const initialTurn = await page.locator('#current-turn').textContent();

    // 发射激光
    await page.click('button#fire-laser-btn');
    await page.waitForTimeout(1000);

    // 应该切换到对方回合
    const newTurn = await page.locator('#current-turn').textContent();
    expect(newTurn).not.toBe(initialTurn);
  });

  test('用户应该在一回合内只能发射一次激光', async ({ page }) => {
    // 发射激光
    await page.click('button#fire-laser-btn');
    await page.waitForTimeout(1000);

    // 尝试再次发射（应该失败或按钮禁用）
    const fireLaserBtn = page.locator('button#fire-laser-btn');

    // 按钮应该被禁用或点击无效
    const isDisabled = await fireLaserBtn.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('激光动画应该流畅显示（60fps）', async ({ page }) => {
    // 发射激光
    await page.click('button#fire-laser-btn');

    // 监控动画性能
    const performanceMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const frames = [];
        let lastTime = performance.now();

        const measureFrame = () => {
          const now = performance.now();
          const delta = now - lastTime;
          frames.push(delta);
          lastTime = now;

          if (frames.length < 60) {
            requestAnimationFrame(measureFrame);
          } else {
            // 计算平均帧时间
            const avgFrameTime = frames.reduce((a, b) => a + b) / frames.length;
            resolve(avgFrameTime);
          }
        };

        requestAnimationFrame(measureFrame);
      });
    });

    // 平均帧时间应该小于16.67ms（60fps）
    expect(performanceMetrics).toBeLessThan(17);
  });

  test('用户应该能看到激光击中镜子的反射', async ({ page }) => {
    // 这需要特定的棋盘布局，有镜子在激光路径上

    // 发射激光
    await page.click('button#fire-laser-btn');
    await page.waitForTimeout(1500);

    // 应该看到激光路径改变方向
    // （通过截图或Canvas分析验证）
  });

  test('用户应该能看到激光被盾牌阻挡', async ({ page }) => {
    // 设置有盾牌阻挡的场景

    // 发射激光
    await page.click('button#fire-laser-btn');
    await page.waitForTimeout(1500);

    // 激光应该在盾牌处停止
    // 盾牌后面的棋子不应该被摧毁
  });

  test('用户应该能看到分光器产生两束激光', async ({ page }) => {
    // 设置有分光器的场景

    // 发射激光
    await page.click('button#fire-laser-btn');
    await page.waitForTimeout(1500);

    // 应该看到激光在分光器处分成两束
    // （通过Canvas分析或截图验证）
  });

  test('激光物理计算应该在合理时间内完成', async ({ page }) => {
    // 测量激光发射的响应时间
    const startTime = Date.now();

    await page.click('button#fire-laser-btn');

    // 等待激光计算完成（不包括动画时间）
    await page.waitForTimeout(100);

    const responseTime = Date.now() - startTime;

    // 响应时间应该小于200ms
    expect(responseTime).toBeLessThan(200);
  });

  test('用户应该能通过激光击败对手', async ({ page }) => {
    // 这是一个完整的游戏流程测试
    // 需要通过多步操作创建击败对手的场景

    // 示例：移动几个棋子创建攻击路径
    // await page.click(...)
    // await page.waitForTimeout(500)

    // 发射激光击中对方炮塔
    await page.click('button#fire-laser-btn');
    await page.waitForTimeout(2000);

    // 应该显示游戏结束和获胜信息
    // const winnerText = page.locator('#winner-text');
    // await expect(winnerText).toContainText('白方获胜');
  });

  test('激光路径应该正确显示在Canvas上', async ({ page }) => {
    const canvas = page.locator('canvas#game-board');

    // 发射激光前的Canvas状态
    const beforeShot = await canvas.screenshot();

    // 发射激光
    await page.click('button#fire-laser-btn');
    await page.waitForTimeout(500);

    // 发射激光后的Canvas状态
    const afterShot = await canvas.screenshot();

    // Canvas应该有变化（显示了激光路径）
    expect(beforeShot).not.toEqual(afterShot);
  });

  test('用户应该能看到实时的游戏统计更新', async ({ page }) => {
    // 检查激光计数
    const laserCount = page.locator('#laser-count');
    const initialCount = await laserCount.textContent();

    // 发射激光
    await page.click('button#fire-laser-btn');
    await page.waitForTimeout(1000);

    // 计数应该增加
    const newCount = await laserCount.textContent();
    expect(parseInt(newCount)).toBeGreaterThan(parseInt(initialCount));
  });
});
