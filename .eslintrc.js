// https://eslint.org/docs/user-guide/configuring

module.exports = {
    root: true,
    parserOptions: {
        parser: 'babel-eslint'
    },
    env: {
        browser: true,
    },
    extends: [
        // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
        // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
        'plugin:vue/essential',
        // https://github.com/standard/standard/blob/master/docs/RULES-en.md
        'standard'
    ],
    // required to lint *.vue files
    plugins: [
        'vue'
    ],
    // add your custom rules here
    rules: {
        // allow async-await
        'generator-star-spacing': 'off',
        'indent': 'off',
        'space-before-function-paren': 0,
        'no-tabs': 'off',
        'vue/no-parsing-error': [2, { "x-invalid-end-tag": false }],
        // allow debugger during development
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'camelcase': 'off', // 关闭驼峰
        'no-extra-boolean-cast': 'off', // 关闭双重否定
        'padded-blocks': 'off', // 函数执行，第一行间隔
        'handle-callback-err': 'off' // 关闭要处理的预期错误 Expected error to be handled 
    }
}
