#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const packagesDir = join(rootDir, 'packages');

/**
 * 执行命令并返回输出
 */
function exec(command, options = {}) {
  try {
    return execSync(command, { 
      encoding: 'utf8', 
      cwd: rootDir,
      ...options 
    }).trim();
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

/**
 * 获取所有包
 */
function getAllPackages() {
  return exec('ls packages').split('\n').filter(Boolean);
}

/**
 * 读取包的 package.json
 */
function readPackageJson(packageName) {
  const packagePath = join(packagesDir, packageName, 'package.json');
  if (!existsSync(packagePath)) {
    throw new Error(`Package.json not found for ${packageName}`);
  }
  return JSON.parse(readFileSync(packagePath, 'utf8'));
}

/**
 * 写入包的 package.json
 */
function writePackageJson(packageName, packageJson) {
  const packagePath = join(packagesDir, packageName, 'package.json');
  writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
}

/**
 * 增加版本号
 */
function bumpVersion(version, type = 'patch') {
  // 处理 beta 版本，如 0.0.1-beta.10
  const betaMatch = version.match(/^(\d+)\.(\d+)\.(\d+)-beta\.(\d+)$/);
  if (betaMatch) {
    const [, major, minor, patch, beta] = betaMatch.map(Number);
    
    switch (type) {
      case 'major':
        return `${major + 1}.0.0`;
      case 'minor':
        return `${major}.${minor + 1}.0`;
      case 'patch':
        return `${major}.${minor}.${patch + 1}`;
      case 'beta':
        return `${major}.${minor}.${patch}-beta.${beta + 1}`;
      default:
        return `${major}.${minor}.${patch + 1}`;
    }
  }
  
  // 处理普通版本
  const versionMatch = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (versionMatch) {
    const [, major, minor, patch] = versionMatch.map(Number);
    
    switch (type) {
      case 'major':
        return `${major + 1}.0.0`;
      case 'minor':
        return `${major}.${minor + 1}.0`;
      case 'patch':
        return `${major}.${minor}.${patch + 1}`;
      case 'beta':
        return `${major}.${minor}.${patch + 1}-beta.1`;
      default:
        return `${major}.${minor}.${patch + 1}`;
    }
  }
  
  throw new Error(`Invalid version format: ${version}`);
}

/**
 * 获取包依赖关系
 */
function getPackageDependencies() {
  const packages = exec('ls packages').split('\n').filter(Boolean);
  const dependencies = {};
  
  for (const pkg of packages) {
    const packageJson = readPackageJson(pkg);
    dependencies[pkg] = {
      name: packageJson.name,
      dependencies: Object.keys(packageJson.dependencies || {})
        .filter(dep => dep.startsWith('@onachi/'))
        .map(dep => dep.replace('@onachi/', ''))
    };
  }
  
  return dependencies;
}

/**
 * 根据依赖关系确定发布顺序
 */
function getPublishOrder(affectedPackages, allDependencies) {
  const visited = new Set();
  const order = [];
  
  function visit(pkg) {
    if (visited.has(pkg)) return;
    visited.add(pkg);
    
    // 先访问依赖
    if (allDependencies[pkg]) {
      for (const dep of allDependencies[pkg].dependencies) {
        if (affectedPackages.includes(dep)) {
          visit(dep);
        }
      }
    }
    
    order.push(pkg);
  }
  
  for (const pkg of affectedPackages) {
    visit(pkg);
  }
  
  return order;
}

/**
 * 更新工作区依赖版本
 */
function updateWorkspaceDependencies(publishedPackages) {
  const packages = exec('ls packages').split('\n').filter(Boolean);
  
  for (const pkg of packages) {
    const packageJson = readPackageJson(pkg);
    let updated = false;
    
    // 更新 dependencies
    if (packageJson.dependencies) {
      for (const [depName, version] of Object.entries(packageJson.dependencies)) {
        const depPkg = depName.replace('@onachi/', '');
        if (publishedPackages[depPkg]) {
          packageJson.dependencies[depName] = `${publishedPackages[depPkg]}`;
          updated = true;
        }
      }
    }
    
    // 更新 devDependencies
    if (packageJson.devDependencies) {
      for (const [depName, version] of Object.entries(packageJson.devDependencies)) {
        const depPkg = depName.replace('@onachi/', '');
        if (publishedPackages[depPkg]) {
          packageJson.devDependencies[depName] = `${publishedPackages[depPkg]}`;
          updated = true;
        }
      }
    }
    
    if (updated) {
      writePackageJson(pkg, packageJson);
      console.log(`✅ Updated workspace dependencies for ${pkg}`);
    }
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 Starting manual publish process...');
  
  // 检查命令行参数
  const args = process.argv.slice(2);
  const versionType = args.find(arg => ['major', 'minor', 'patch', 'beta'].includes(arg)) || 'patch';
  
  console.log(`📈 Version bump type: ${versionType}`);
  
  // 检查是否在 Git 仓库中
  try {
    exec('git rev-parse --git-dir');
  } catch {
    console.error('❌ Not in a Git repository');
    process.exit(1);
  }
  
  // 检查是否有未提交的文件
  // try {
  //   const status = exec('git status --porcelain packages/');
  //   if (status.length > 0) {
  //     console.error('❌ There are uncommitted changes in packages/ directory:');
  //     console.error(status);
  //     console.error('Please commit or stash your changes before publishing.');
  //     process.exit(1);
  //   }
  //   console.log('✅ Packages directory is clean, proceeding with publish...');
  // } catch (error) {
  //   console.error('❌ Failed to check git status:', error.message);
  //   process.exit(1);
  // }
  
  // 获取所有包
  const allPackages = getAllPackages();
  console.log(`📦 All packages: ${allPackages.join(', ')}`);
  
  // 获取包依赖关系和发布顺序
  const allDependencies = getPackageDependencies();
  const publishOrder = getPublishOrder(allPackages, allDependencies);
  console.log(`🔄 Publish order: ${publishOrder.join(' → ')}`);
  
  const publishedPackages = {};
  
  // 按顺序发布每个包
  for (const pkg of publishOrder) {
    console.log(`\n🔄 Processing package: ${pkg}`);
    
    // 读取并更新版本
    const packageJson = readPackageJson(pkg);
    const oldVersion = packageJson.version;
    const newVersion = bumpVersion(oldVersion, versionType);
    
    packageJson.version = newVersion;
    writePackageJson(pkg, packageJson);
    
    console.log(`📈 ${pkg}: ${oldVersion} → ${newVersion}`);
    publishedPackages[pkg] = newVersion;
    
    // 构建包
    console.log(`🔨 Building ${pkg}...`);
    exec(`pnpm --filter @onachi/${pkg} run build`);
  }
  
  // 更新工作区中的依赖版本
  if (Object.keys(publishedPackages).length > 0) {
    console.log('\n🔄 Updating workspace dependencies...');
    updateWorkspaceDependencies(publishedPackages);
    
    // 提交版本更新
    console.log('\n📝 Committing version updates...');
    // exec('git add .');
    // exec(`git commit -m "chore: release all packages v${Object.values(publishedPackages)[0]}"`);
    
    // // 创建标签
    // const tagName = `v${Object.values(publishedPackages)[0]}`;
    // exec(`git tag ${tagName}`);
    // console.log(`🏷️  Created tag: ${tagName}`);
  }

  Object.keys(publishedPackages).forEach(pkg => {
    // 发布到 npm
    console.log(`📤 Publishing ${pkg} to npm...`);
    try {
      const publishCommand = versionType === 'beta' 
        ? `cd packages/${pkg} && npm publish --tag beta`
        : `cd packages/${pkg} && npm publish`;
      exec(publishCommand);
      console.log(`✅ Successfully published ${pkg}@${publishedPackages[pkg]}`);
    } catch (error) {
      console.error(`❌ Failed to publish ${pkg}:`, error.message);
      // 继续处理其他包
    }
  })
  
  console.log('\n🎉 Manual publish process completed!');
  console.log('\n📋 Usage:');
  console.log('  node scripts/update-versions.js [patch|minor|major|beta]');
  console.log('  Default version type is "patch"');
  console.log('  Beta versions are published with --tag beta to npm');
}

// 运行主函数
main().catch(error => {
  console.error('❌ Manual publish failed:', error);
  process.exit(1);
});
