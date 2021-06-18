const id = 'apisurance';

/** @type {import('@redocly/openapi-cli').CustomRulesConfig} */
const decorators = {
    oas3: {
        'remove-internal-operations': () => {
            let hiddenTags = [];

            return {
                Tag: {
                    enter(tag) {
                      if(tag['x-internal']) {
                          hiddenTags.push(tag.name);
                      }
                    },
                    leave(tag, ctx) {
                        // Clean at the end only
                        if(ctx.key === ctx.parent.length - 1) {
                            let validItems = ctx.parent.filter(v => !v['x-internal']);
                            if(validItems.length !== ctx.parent.length) {
                                ctx.parent.splice(0, ctx.parent.length);
                                for(let i = 0; i < validItems.length; i++) {
                                    ctx.parent.push(validItems[i]);
                                }
                            }
                        }

                    }
                },
                PathItem: {
                    leave(pathItem, ctx) {
                        // delete if the path itself is marked with x-internal
                        if (pathItem['x-internal']) {
                            delete ctx.parent[ctx.key];
                        }

                        // delete any operations inside of a path marked with x-internal
                        const operations = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];
                        for (const operation of operations) {
                            if (!pathItem[operation]) continue;
                            if (pathItem[operation]['x-internal'] || pathItem[operation].tags.some(r => hiddenTags.includes(r))) {
                                delete pathItem[operation];
                            }
                        }

                        // delete the path if there are no operations remaining in it
                        if (Object.keys(pathItem).length === 0) {
                            delete ctx.parent[ctx.key];
                        }
                    }
                }
            }
        },
    },
};

module.exports = {
    id,
    decorators,
};
