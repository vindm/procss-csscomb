var FS = require('fs'),
    PATH = require('path'),
    UTIL = require('util'),
    Comb = require('csscomb'),
    colors = require('colors');

var ProcssCsscomb = {

    after : function(scope) {
        var fixed = 0,
            processed = 0;

        scope.files.forEach(function(file) {
            file.isChanged && file._plugins.some(function(plugin) {
                var result;

                if (plugin.plugin === ProcssCsscomb) {
                    result = new Comb()
                        .configure(ProcssCsscomb.resolveConfig(plugin.config.csscomb_config))
                        .processString(file.toString());

                    if (result !== file.content) {
                        file.content = result;
                        fixed++;
                    }
                    processed++;

                    return true;
                }
            });
        });

        if (processed !== 0) {
            ProcssCsscomb.report(processed, fixed);
        }
    }

};

/**
 * @static
 * @param {Object|String} cnfg Config or config path
 * @returns {Object|undefined} Config
 */
ProcssCsscomb.resolveConfig = function(cnfg) {
    var configPath,
        config;

    if ( ! cnfg || typeof cnfg === 'string') {
        configPath = cnfg &&
            PATH.resolve(cnfg) ||
            Comb.getCustomConfigPath();

        if ( ! FS.existsSync(configPath)) {
            config = Comb.getConfig(configPath);
        } else if (configPath.match(/\.css$/)) {
            config = Comb.detectInFile(configPath);
        } else {
            config = Comb.getCustomConfig(configPath);
        }
    } else if (typeof cnfg === 'object') {
        config = cnfg;
    }

    return config;
};

/**
 * @static
 * @type {Function}
 */
ProcssCsscomb.report = (function() {
    function time() {
        var dt = new Date();

        return zeros(dt.getHours(), 2) + ':' +
            zeros(dt.getMinutes(), 2) + ':' +
            zeros(dt.getSeconds(), 2) + '.' +
            zeros(dt.getMilliseconds(), 3) + ' - ';
    }
    function zeros(s, l) {
        s = String(s);

        while (s.length < l) {
            s = '0' + s;
        }

        return s;
    }

    /**
     * @param {Number} processed
     * @param {Number} fixed
     */
    return function(processed, fixed) {
        UTIL.puts(
            colors.grey(
                time() +
                '[' + colors.magenta('Procss-Csscomb') + '] '+
                '[' + colors.green('Fix') + '] ' +
                colors.blue(fixed + '/' + processed + ' files')
            )
        );
    };
})();

module.exports = ProcssCsscomb;
