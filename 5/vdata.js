/*
    v-data JS 1.0.0
    Janderson Costa
    Copyright 2016, MIT License
    Descrição: ...

    Uso: ver demo.html
*/

function vdata(DATA) {
    DATA = DATA ? DATA : window;
    var ATTRIBUTES = "[v-data], [v-value], [v-text], [v-repeat], [v-hide], [v-show], [v-disabled], [v-enabled], [v-class]",
        ELEMENTS = document.querySelectorAll(ATTRIBUTES);

    // PÚBLICO

    return {
        bind: function(elements, callback) {
            bind(elements, null, callback);
        }
    };


    // FUNÇÕES

    function bind(elements, data, callback) {
        elements = elements ? elements : ELEMENTS;

        if (!elements.length)
            elements = [elements];

        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];

            // v-repeat - não processa elementos com este atributo
            if (element.attributes["v-repeat"]) {
                repeatBind(element);
                continue;
            }

            // não processa elementos filhos de v-repeat
            if (element.parentNode && element.parentNode.attributes["v-repeat"]) // <<<<<<<<<< remover?
                continue;

            // v-data
            vData(element, data);

            // v-value
            vValue(element, data);

            // v-text
            vText(element, data);

            // v-class="true/false"
            vClass(element, data);

            // v-show="true/false"
            vShow(element, data);

            // v-hide="true/false"
            vHide(element, data);

            // v-enabled="true/false"
            vEnabled(element, data);

            // v-disabled="true/false"
            vDisabled(element, data);

            if (callback)
                callback(element);
        }
    }

    function repeatBind(template) {
        var attr = template.attributes["v-repeat"],
            dataArray = getValue(attr.value, DATA);

        for (var i = 0; i < dataArray.length; i++) {
            var element = template.cloneNode(true),
                attributes = element.attributes,
                tagName = element.tagName,
                data = dataArray[i],
                key;

            element.removeAttribute("v-repeat");
            template.parentNode.appendChild(element);

            // <option/>
            if (tagName === "OPTION" && !attributes["v-data"] && !attributes["v-value"] && !attributes["v-text"])
                element.setAttribute("v-data", "");

            // bind
            bind(element, data);

            var childs = element.querySelectorAll(ATTRIBUTES);

            if (childs.length)
                bind(childs, data);
        }

        // deleta o template
        template.parentNode.removeChild(template);
    }

    function getValue(attrValue, data) {
        var keys = attrValue.match(/\./) ? attrValue.split(".") : [attrValue],
            value;

        value = data ? data : DATA;

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

        if (value.document) // se o valor do atributo não é varíável ou objeto
            return attrValue;
        else
            return value;
    }

    function vData(element, data) {
        var attr = element.attributes["v-data"];

        if (attr) {
            value = getValue(attr.value, data);

            if (typeof element.value !== "undefined") { // input, textarea, select, option
                element.value = value;

                // <option/>
                if (element.tagName === "OPTION") {
                    element.innerText = value;
                }

                if (element.type === "checkbox")
                    element.checked = value; // true/false
            } else {
                element.innerHTML = value;
            }

            element.removeAttribute("v-data");
        }
    }

    function vValue(element, data) {
        var attr = element.attributes["v-value"],
            tagName = element.tagName;

        if (attr) {
            if (tagName === "SELECT") {
                setTimeout(function() {
                    finish();
                }, 0);
            } else {
                finish();
            }
        }

        function finish() {
            element.value = getValue(attr.value, data);
            element.removeAttribute("v-value");
        }
    }

    function vText(element, data) {
        var attr = element.attributes["v-text"];

        if (attr) {
            element.innerText = getValue(attr.value, data);
            element.removeAttribute("v-text");
        }
    }

    function vClass(element, data) {
        var attr = element.attributes["v-class"];

        if (attr) {
            var values = attr.value.split(":"),
                classes = values[0].trim().replace(/  /g, "").split(" "),
                _data = values[1].trim(),
                value = getValue(_data, data);

            if (value)
                for (var i in classes)
                    element.classList.add(classes[i]);

            element.removeAttribute("v-class");
        }
    }

    function vHide(element, data) {
        var attr = element.attributes["v-hide"];

        if (attr) {
            element.style.display = "";

            if (getValue(attr.value, data))
                element.style.display = "none";

            element.removeAttribute("v-hide");
        }
    }

    function vShow(element, data) {
        var attr = element.attributes["v-show"];

        if (attr) {
            element.style.display = "none";

            if (getValue(attr.value, data))
                element.style.display = "";

            element.removeAttribute("v-show");
        }
    }

    function vEnabled(element, data) {
        var attr = element.attributes["v-enabled"];

        if (attr) {
            disable(element);

            if (getValue(attr.value, data))
                enable(element);

            element.removeAttribute("v-enabled");
        }
    }

    function vDisabled(element, data) {
        var attr = element.attributes["v-disabled"];

        if (attr) {
            enable(element);

            if (getValue(attr.value, data))
                disable(element);

            element.removeAttribute("v-disabled");
        }
    }

    function enable(element) {
        element.disabled = "";
        element.style.pointerEvents = "";
        element.style.opacity = "";

        forEach(element.querySelectorAll("input, textarea, select, option, button"), function(child) {
            child.disabled = "";
        });
    }

    function disable(element) {
        element.disabled = true;
        element.style.pointerEvents = "none";
        element.style.opacity = 0.5;

        forEach(element.querySelectorAll("input, textarea, select, option, button"), function(child) {
            child.disabled = true;
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
