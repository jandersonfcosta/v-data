/*
    v-data JS 1.0.0
    Janderson Costa
    Copyright 2016, MIT License
    Descrição: ...

    Uso: ver demo.html
*/

function vdata(data) {
    // PÚBLICO
    return {
        bind: function(elements, callback) {
            bind(elements, null, callback);
        },
        repeatBind: repeatBind
    };


    // FUNÇÕES
    function bind(elements, _data, callback) {
        var value;

        if (!elements.length)
            elements = [elements];

        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];

            // v-repeat - não processa elementos com este atributo
            if (element.attributes["v-repeat"] || element.parentNode.attributes["v-repeat"]) continue;

            // v-data, v-value, v-text
            var vdata = element.attributes["v-data"] || element.attributes["v-value"] || element.attributes["v-text"];
            if (vdata) {
                value = getData(vdata.value, _data);

                if (typeof element.value !== "undefined") { // input, textarea, select, option
                    element.value = value;

                    if (element.type === "checkbox")
                        element.checked = value; // true/false

                    if (element.tagName === "OPTION")
                        element.innerText = value;
                } else {
                    element.innerHTML = value;
                }
            }

            // v-hide="true/false"
            var vhide = element.attributes["v-hide"];
            if (vhide) {
                element.style.display = "";

                if (getData(vhide.value, _data)) element.style.display = "none";
            }

            // v-show="true/false"
            var vshow = element.attributes["v-show"];
            if (vshow) {
                element.style.display = "none";

                if (getData(vshow.value, _data))
                    element.style.display = "";
            }

            // v-disabled="true/false"
            var vdisabled = element.attributes["v-disabled"];
            if (vdisabled) {
                enable(element);
                if (getData(vdisabled.value, _data))
                    disable(element);
            }

            // v-enabled="true/false"
            var venabled = element.attributes["v-enabled"];
            if (venabled) {
                disable(element);
                if (getData(venabled.value, _data))
                    enable(element);
            }

            if (callback)
                callback(element);
        }
    }

    function repeatBind(templates, callback) {
        if (!templates.length)
            templates = [templates];

        for (var t = 0; t < templates.length; t++) {
            var template = templates[t],
                vrepeat = template.attributes["v-repeat"],
                _data = getData(vrepeat.value, data);

            for (var d in _data) {
                var element = template.cloneNode(true),
                    item = _data[d],
                    key;

                element.removeAttribute("v-repeat");
                template.parentNode.insertBefore(element, element.nextSibling);

                // bind
                bind(element, item);

                var childs = element.querySelectorAll("[v-data]");

                if (childs.length)
                    bind(childs, item);

                // callback
                if (callback)
                    callback(item, element);
            }

            // deleta o template
            template.parentNode.removeChild(template);
        }
    }

    function getData(attrValue, _data) {
        var keys = attrValue.match(/\./) ? attrValue.split(".") : [attrValue],
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

        return value;
    }

    function enable(element) {
        element.style.pointerEvents = "";
        element.style.opacity = "";

        forEach(element.querySelectorAll("input, textarea, select, button"), function(el) {
            el.disabled = "";
        });
    }

    function disable(element) {
        element.style.pointerEvents = "none";
        element.style.opacity = 0.5;

        forEach(element.querySelectorAll("input, textarea, select, button"), function(el) {
            el.disabled = true;
        });
    }

    function forEach(array, callback) {
        for (var i = 0; i < array.length; i++)
            callback(array[i]);
    }
}

// {{ key }}
// key = template
// .innerHTML
// .replace(/ /g, "")
// .match(/[{{a-z0-9}}]+/gi)[0]
// .match(/[a-z0-9]+/gi)[0]
// .trim();
