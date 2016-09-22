/*
    html-data binder 1.0.0
    Janderson Costa
    Copyright 2016, MIT License
    Descrição: Atualiza o valor de elementos html identificados com os atributos [data] e [data-repeat].

    Uso: ver demo.html
*/

function htmlData(data) {
    return {
        bind: bind,
        repeatBind: repeatBind
    };

    function bind(elements, _data) {
        if (!elements.length)
            elements = [elements];

        for (var i = 0; i < elements.length; i++) {
            var element = elements[i],
                dataAttr = element.attributes.data.value,
                keys = dataAttr.match(/\./) ? dataAttr.split(".") : [dataAttr],
                value;

            value = _data ? _data : data;

            // percorre os nós até encontrar o valor
            for (var k in keys) {
                var key = keys[k], index = null;

                // array item - ex.: items[2]
                if (key.search(/\[/) > 0) {
                    key = key.split("[")[0];
                    index = keys[k].split("[")[1].match(/[0-9]+/)[0];
                }

                if (value.hasOwnProperty(key)) {
                    if (index)
                        value = value[key][index];
                    else
                        value = value[key];
                }
            }

            if (typeof element.value !== "undefined") // input, textarea, select
                element.value = value;
            else
                element.innerHTML = value;
        }
    }

    function repeatBind(templates, callback) {
        if (!templates.length)
            templates = [templates];

        for (var t = 0; t < templates.length; t++) {
            var template = templates[t];

            for (var d in data) {
                var element = template.cloneNode(true),
                    item = data[d],
                    key,
                    value = item;

                template.parentNode.insertBefore(element, element.nextSibling);

                if (template.tagName === "OPTION") { // select
                    if (typeof item === "object") {
                        key = template.innerHTML.trim();
                        value = item[key];
                    }

                    element.innerHTML = value;
                } else {
                    bind(element.querySelectorAll("[data]"), item);
                }

                if (callback)
                    callback(item, element);
            }

            template.parentNode.removeChild(template);
        }
    }
}

// {{ key }}
// key = template
// .innerHTML
// .replace(/ /g, "")
// .match(/[{{a-z0-9}}]+/gi)[0]
// .match(/[a-z0-9]+/gi)[0]
// .trim();
