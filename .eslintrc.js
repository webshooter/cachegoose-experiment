const OFF = 0;
const WARN = 1;
const ERROR = 2;

module.exports = {
    "env": {
        "es6": true,
        "jest": true,
    },

    "ecmaFeatures": {
        // env=es6 doesn't include modules, which we are using
        "modules": true
    },

    "extends": "airbnb-base",

    "rules": {
        "semi": [ ERROR, "always" ],
        "quotes": [ ERROR, "double" ],
        "indent": [ WARN, 2 ],
        "object-curly-spacing": OFF,
        "object-curly-newline": OFF,
        "arrow-parens": [ ERROR, "as-needed" ],
    },
};