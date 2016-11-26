const shortSummary = (context, event) => {
    const modules = exports.platform.modulesLoader.getLoadedModules('module');
    let help = `${exports.platform.packageInfo.name.toProperCase()} [${exports.platform.packageInfo.version}]\n--------------------\n${exports.platform.packageInfo.homepage}\n\n`;

    for (let i = 0; i < modules.length; i++) {
        if (!modules[i].help) {
            continue;
        }
        let cmdHelp = modules[i].ignoreHelpContext
            ? modules[i].help(context.commandPrefix, event)
            : modules[i].help.call(context, context.commandPrefix, event);
        for (let j = 0; j < cmdHelp.length; j++) {
            help += `→ ${cmdHelp[j][0]}\n\t${cmdHelp[j][1]}\n`;
        }
    }
    return help;
};

const longDescription = (moduleName, context, event) => {
    const module = exports.platform.modulesLoader.getLoadedModules('module').find(element => element.__descriptor.name === moduleName);

    if (!module || module.length === 0) {
        return $$`No help found`;
    }

    if (module.length > 1) {
        return $$`Multiple different help results`;
    }

    let help = '';
    if (module.help) {
       const cmdHelp = module.ignoreHelpContext ?
           module.help(context.commandPrefix, event) :
           module.help.call(context, context.commandPrefix, event);

       for (let i = 0; i < cmdHelp.length; i++) {
           const text = cmdHelp[i].length === 3 ? cmdHelp[i][2] : cmdHelp[i][1];
           help += `${cmdHelp[i][0]}\n--------------------\n${text}\n\n`;
       }
    }
    else {
       help = $$`Does something. The unhelpful author didn't specify what.`;
    }
    return help;
};

exports.run = (api, event) => {
    const commands = event.arguments,
        context = {
            commandPrefix: api.commandPrefix
        };
    let help;
    if (commands.length === 1) {
        help = shortSummary(context, event);
    }
    else {
        commands.splice(0, 1);
        help = longDescription(commands.join(' '), context, event);
    }

    api.sendPrivateMessage(help, event.thread_id, event.sender_id);
    return true;
};

const createHelp = (module) => {
    if (module.help || ! module.__descriptor.help) {
        return;
    }

    module.help = (commandPrefix) => {
        const h = [],
            descriptor = module.__descriptor;
        for (let i = 0; i < descriptor.help.length; i++) {
            const l = [];
            for (let j = 0; j < descriptor.help[i].length; j++) {
                const expression = descriptor.help[i][j].split(/{{commandPrefix}}/g),
                    prefixes = Array.from({ length: (expression.length - 1) }, () => commandPrefix);
                l.push($$.translate(expression, prefixes, descriptor.name));
            }
            h.push(l);
        }
        return h;
    };
};

const loadCallback = (data) => {
    if (!data.success) return;
    createHelp(data.module);
};

exports.load = () => {
    exports.platform.modulesLoader.on('load', loadCallback);
    const modules = exports.platform.modulesLoader.getLoadedModules('module');
    for (let module of modules) {
        module.help = createHelp(module);
    }
};

exports.unload = () => {
    exports.platform.modulesLoader.removeListener('load', loadCallback);
};
