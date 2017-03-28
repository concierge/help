## Help
The default help system for Concierge.

### Installation
The easiest way to install is by using `/kpm install help`.

### Usage
Help provides two Concierge commands:
- `/help`. This command shows the short version of help for all modules that provide it. As this can grow to have a very long list of commands it will be sent as a private message to the user that sends it (if your platform supports PMs that is).
- `/help <module name>`. This command shows the long version of help (if provided) for a module.

### Using with your module
Modules can provide help by one of two approaches. In order of precedence:

#### exports.help(commandPrefix, event) ⇒ <code>array[array[string, string, string?]]</code>
A module can provide an `exports.help` method. This approach allows for custom logic before returning a help string.

Help returned from this method is represented by an array of arrays. Each inner array contains either two or three strings in the following order:
1. The command to be executed. E.g. `/example`
2. A short description of the command.
3. An optional long description of the command.

**Note**: This method should not be implemented if the `"help"` property has been provided in `kassy.json`. See below.
**Kind**: API method
**Returns**: <code>array[array[string, string, string?]]</code>.

| Param | Type | Description |
| --- | --- | --- |
| commandPrefix | <code>string</code> | The command prefix associated with the integration that the help was requested on. |
| event | <code>Object</code> | The event object that caused help to be requested. |

**Example**
A simple hello world implementation:
```js
exports.help = (commandPrefix) => {
    return [
        [commandPrefix + 'HelloWorld', 'Prints "Hello World".'],
        [commandPrefix + 'HelloWorldExtended', 'Prints "Hello World".', 'Prints "Hello World" with extended help.']
    ];
}
```

#### kassy.json#help ⇒ <code>array[array[string, string, string?]]</code>
A module can provide a `help` property in its `kassy.json`.

**Kind**: Object property

As with the method, this returns help text associated with this module.
This consists of multiple arrays, each inner array represents one entry in the Concierge help system. Each entry takes the format: `['CommandString/Example', 'ShortDescription', 'OptionalLongDescription']`. As is suggested by the word 'Optional', the last element of this array does not need to be provided (but is highly recommended).

Unlike the method, any string within an entry can contain the special substring `{{commandPrefix}}` which will be replaced with the appropriate string when help is displayed. Additionally, displayed help can also be translated, this is done by using the help strings within `kassy.json` as keys, which then can be looked up within the built in translation service.

**Example**
A simple hello world implementation:
```json
{
    "help": [
        ["{{commandPrefix}}helloworld", "Responds with hello world!", "TranslateableLookupKeyHere"]
    ]
}
```

### Middleware
Help provides middleware such that help output can be intercepted and replaced if desired. This is a template to print the string `Hello middleware` on retreiving the help of each module:

```js
let helpModule = null;

const helpMiddleware = (mod, commandPrefix, event, next) => {
    console.log('Hello middleware');
    return next();
};

exports.load = platform => {
    helpModule = platform.getModule('help');
    helpModule.use('getHelp', helpMiddleware);
};

exports.unload = () => {
    helpModule.unuse('getHelp', helpMiddleware);
};
```
