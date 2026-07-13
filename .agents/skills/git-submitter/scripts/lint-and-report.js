import { execSync } from 'child_process';

/**
 * 这个脚本用于识别 Git 中的改动文件，并运行 ESLint --fix。
 * 它会区分“已修复”和“仍有错误”的文件。
 */

function runLint() {
    try {
        // 获取暂存区和工作区的修改文件 (JS/TS/Vue)
        const status = execSync('git status --porcelain', { encoding: 'utf-8' });
        const files = status
            .split('\n')
            .map(line => line.slice(3).trim())
            .filter(f => /\.(js|ts|vue|jsx|tsx)$/.test(f));

        if (files.length === 0) {
            console.log('没有需要 lint 的文件。');
            process.exit(0);
        }

        console.log(`正在检查 ${files.length} 个文件...`);

        const results = {
            fixed: [],
            errored: []
        };

        for (const file of files) {
            try {
                execSync(`npx eslint --fix "${file}"`, { stdio: 'inherit' });
                // 检查执行后的 diff 看看有没有被改过
                const diff = execSync(`git diff "${file}"`, { encoding: 'utf-8' });
                if (diff) {
                    results.fixed.push(file);
                }
            } catch (err) {
                results.errored.push(file);
            }
        }

        console.log('\n--- Lint 报告 ---');
        if (results.fixed.length > 0) {
            console.log('✅ 已自动修复文件:');
            results.fixed.forEach(f => console.log(`  - ${f}`));
        }
        if (results.errored.length > 0) {
            console.log('❌ 仍存在错误的文件 (需手动干预):');
            results.errored.forEach(f => console.log(`  - ${f}`));
            process.exit(1);
        }
        if (results.fixed.length === 0 && results.errored.length === 0) {
            console.log('✨ 所有文件均符合规范。');
        }

    } catch (e) {
        console.error('Lint 运行失败:', e.message);
        process.exit(1);
    }
}

runLint();
