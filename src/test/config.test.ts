import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * 功能: digital-wardrobe, 属性 1: 技术栈配置正确性
 * 验证需求: 需求1.1, 1.2
 */
describe('项目配置验证', () => {
  describe('技术栈配置正确性', () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf-8'));
    
    it('应该使用React作为主要框架', () => {
      expect(packageJson.dependencies.react).toBeDefined();
      expect(packageJson.dependencies['react-dom']).toBeDefined();
      expect(packageJson.dependencies.react.startsWith('^18')).toBe(true);
    });

    it('应该使用Vite作为构建工具', () => {
      expect(packageJson.devDependencies.vite).toBeDefined();
      expect(packageJson.scripts.dev).toBe('vite');
      expect(packageJson.scripts.build).toContain('vite build');
    });

    it('应该使用TypeScript', () => {
      expect(packageJson.devDependencies.typescript).toBeDefined();
      expect(packageJson.scripts.build).toContain('tsc');
    });

    it('应该配置Tailwind CSS', () => {
      expect(packageJson.devDependencies.tailwindcss).toBeDefined();
      expect(packageJson.devDependencies.autoprefixer).toBeDefined();
      expect(packageJson.devDependencies.postcss).toBeDefined();
    });

    it('应该包含必要的React相关依赖', () => {
      expect(packageJson.dependencies['react-router-dom']).toBeDefined();
      expect(packageJson.dependencies['lucide-react']).toBeDefined();
      expect(packageJson.dependencies['@use-gesture/react']).toBeDefined();
    });

    it('应该包含测试框架配置', () => {
      expect(packageJson.devDependencies.vitest).toBeDefined();
      expect(packageJson.devDependencies['@testing-library/react']).toBeDefined();
      expect(packageJson.devDependencies['@testing-library/jest-dom']).toBeDefined();
      expect(packageJson.devDependencies['fast-check']).toBeDefined();
    });

    it('应该有正确的脚本配置', () => {
      expect(packageJson.scripts.test).toBe('vitest');
      expect(packageJson.scripts['test:ui']).toBe('vitest --ui');
      expect(packageJson.scripts.preview).toBe('vite preview');
    });
  });

  describe('移动端优化配置', () => {
    const htmlContent = readFileSync(join(process.cwd(), 'index.html'), 'utf-8');
    
    it('应该设置正确的viewport meta标签', () => {
      expect(htmlContent).toContain('width=device-width');
      expect(htmlContent).toContain('initial-scale=1.0');
      expect(htmlContent).toContain('user-scalable=no');
    });

    it('应该设置中文语言', () => {
      expect(htmlContent).toContain('lang="zh-CN"');
    });

    it('应该包含PWA相关的meta标签', () => {
      expect(htmlContent).toContain('theme-color');
    });
  });

  describe('配置文件存在性验证', () => {
    it('应该存在所有必要的配置文件', () => {
      expect(existsSync('package.json')).toBe(true);
      expect(existsSync('vite.config.ts')).toBe(true);
      expect(existsSync('tsconfig.json')).toBe(true);
      expect(existsSync('tailwind.config.js')).toBe(true);
      expect(existsSync('postcss.config.js')).toBe(true);
      expect(existsSync('index.html')).toBe(true);
    });

    it('应该存在源代码目录结构', () => {
      expect(existsSync('src')).toBe(true);
      expect(existsSync('src/main.tsx')).toBe(true);
      expect(existsSync('src/App.tsx')).toBe(true);
      expect(existsSync('src/index.css')).toBe(true);
      expect(existsSync('src/types/index.ts')).toBe(true);
      expect(existsSync('src/context/AppContext.tsx')).toBe(true);
    });

    it('应该存在组件目录结构', () => {
      expect(existsSync('src/components')).toBe(true);
      expect(existsSync('src/components/Layout')).toBe(true);
      expect(existsSync('src/components/Pages')).toBe(true);
      expect(existsSync('src/components/Layout/BottomNavigation.tsx')).toBe(true);
      expect(existsSync('src/components/Layout/PageContainer.tsx')).toBe(true);
    });
  });
});