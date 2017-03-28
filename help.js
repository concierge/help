const Middleware = require('concierge/middleware');

class HelpModule extends Middleware {
    _helpForModule(mod, commandPrefix, event) {
        if (!mod.help && !mod.__descriptor.help) {
            return null;
        }

        if (mod.help) {
            return mod.help(commandPrefix, event);
        }

        const name = mod.__descriptor.name,
            help = mod.__descriptor.help;
        return help.map(h => {
            return h.map(s => {
                const expression = s.split(/{{commandPrefix}}/g),
                    prefixes = Array.from({ length: (expression.length - 1) }, () => commandPrefix);
                return $$.translate(expression, prefixes, name);
            });
        });
    }

    _shortSummary (commandPrefix, event) {
        const modules = this.platform.modulesLoader.getLoadedModules('module'),
            help = [`${this.platform.packageInfo.name.toProperCase()} [${this.platform.packageInfo.version}]\n--------------------\n${this.platform.packageInfo.homepage}\n`];
        for (let mod of modules) {
            const helpArr = this.runMiddlewareSync('getHelp', this._helpForModule.bind(this), mod, commandPrefix, event);
            if (!helpArr) {
                continue;
            }
            help.push(helpArr.map(h => `→ ${h[0]}\n\t${h[1]}`));
        }
        return help.reduce((a,b)=>a.concat(b),[]).join('\n');
    }

    _longDescription (moduleName, commandPrefix, event) {
        const module = this.platform.getModule(moduleName);
        if (!module || module.length === 0) {
            return $$`No help found`;
        }

        if (module.length > 1) {
            return $$`Multiple different help results`;
        }

        const help = this.runMiddlewareSync('getHelp', this._helpForModule.bind(this), module, commandPrefix, event);
        if (help) {
            return help.map(h => `${h[0]}\n--------------------\n${h[2] || h[1]}`).join('\n\n');
        }
        else {
            return $$`Does something. The unhelpful author didn't specify what.`;
        }
    }

    run (api, event) {
        const commands = event.arguments;
        let help;
        if (commands.length === 1) {
            help = this._shortSummary(api.commandPrefix, event);
        }
        else {
            commands.splice(0, 1);
            help = this._longDescription(commands.join(' '), api.commandPrefix, event);
        }
        api.sendPrivateMessage(help, event.thread_id, event.sender_id);
        return true;
    }
}

module.exports = new HelpModule();
