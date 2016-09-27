/*
    v-data JS 1.0.0
    Janderson Costa
    Copyright 2016, MIT License
    Descrição: ...

    Uso: ver demo.html
*/

function vdata(data) {
	cleanRepeatClones(document);

	var DATA = data ? data : window,
		ATTRIBUTES = "[v-data], [v-value], [v-text], [v-repeat], [v-hide], [v-show], [v-disabled], [v-enabled], [v-class]",
		BINDED = [];


	// PÚBLICO

	return {
		bind: function(elements, callback) {
			bind(elements, null, callback);
		}
	};


	// FUNÇÕES

	function cleanRepeatClones(node) {
		// remove todas as cópias de v-repeat

        var attr = "v-id",
            elements = node.querySelectorAll("[" + attr + "]");

        for (var i = 0; i < elements.length; i++) {
            var vId = elements[i].getAttribute("v-id"),
                _elements = node.querySelectorAll("[v-id='" + vId + "']");

            // remove todos exceto o primeiro (template)
            for (var j = 1; j < _elements.length; j++)
                _elements[j].remove();
        }
    }

	function bind(elements, data, callback, canBind) {
		elements = elements ? elements : document.querySelectorAll(ATTRIBUTES);

		if (!elements.length)
			elements = [elements];

		for (var i = 0; i < elements.length; i++) {
			var element = elements[i];

			// não processa elementos v-repeat
			if (element.attributes["v-repeat"] && !isBinded(element, "v-repeat")) {
				repeatBind(element);
				continue;
			}

			// não processa elementos filhos de v-repeat
			if (element.parentNode.attributes["v-repeat"] && !canBind)
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
		var attrName = "v-repeat",
			attr = template.attributes[attrName],
			dataArray = getValue(attr.value, DATA),
            vId = Math.floor((1 + Math.random()) * 0x1000000);

		for (var i = 0; i < dataArray.length; i++) {
			var element = template.cloneNode(true),
				attributes = element.attributes,
				tagName = element.tagName,
				data = dataArray[i];

			element.setAttribute("v-id", vId);

			BINDED.push({
				element: element,
				attr: attrName
			});

			template.parentNode.appendChild(element);

			// <option/>
			if (tagName === "OPTION" && !attributes["v-data"] && !attributes["v-value"] && !attributes["v-text"])
				element.setAttribute("v-data", "");

			// bind
			bind(element, data);

			var childs = element.querySelectorAll(ATTRIBUTES);

			if (childs.length)
				bind(childs, data, null, true);
		}

		// deleta o template
		template.parentNode.removeChild(template);
	}

	function getValue(attrValue, data) {
		var keys = attrValue.match(/\./) ? attrValue.split(".") : [attrValue],
			value = data ? data : DATA;

		// percorre os nós até encontrar o valor
		for (var k in keys) {
			var key = keys[k],
				index = null;

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

		if (value.document || typeof value === "function") // se o valor do atributo é explícito não sendo varíável ou objeto
			return attrValue;
		else
			return value;
	}

	function vData(element, data) {
		var attrName = "v-data",
			attr = element.attributes[attrName];

		if (attr && !isBinded(element, attrName)) {
			var value = getValue(attr.value, data);

			if (typeof element.value !== "undefined") { // input, textarea, select, option
				element.value = value;

				if (element.tagName === "OPTION")
					element.innerText = value;

				if (element.type === "checkbox")
					element.checked = value;
			} else {
				element.innerHTML = value;
			}

			BINDED.push({
				element: element,
				attr: attrName
			});
		}
	}

	function vValue(element, data) {
		var attrName = "v-value",
			attr = element.attributes[attrName],
			tagName = element.tagName;

		if (attr && !isBinded(element, attrName)) {
			if (tagName === "SELECT") {
				setTimeout(function() {
					finish();
				}, 0);
			} else {
				finish();
			}
		}

		function finish() {
			var value = getValue(attr.value, data);

			element.value = value;

			if (element.type === "checkbox")
				element.checked = value;

			BINDED.push({
				element: element,
				attr: attrName
			});
		}
	}

	function vText(element, data) {
		var attrName = "v-text",
			attr = element.attributes[attrName];

		if (attr && !isBinded(element, attrName)) {
			element.innerText = getValue(attr.value, data);
			BINDED.push({
				element: element,
				attr: attrName
			});
		}
	}

	function vClass(element, data) {
		var attrName = "v-class",
			attr = element.attributes[attrName];

		if (attr && !isBinded(element, attrName)) {
			var values = attr.value.split(":"),
				classes = values[0].trim().replace(/  /g, "").split(" "),
				_data = values[1].trim(),
				value = getValue(_data, data);

			if (value)
				for (var i in classes)
					element.classList.add(classes[i]);

			BINDED.push({
				element: element,
				attr: attrName
			});
		}
	}

	function vHide(element, data) {
		var attrName = "v-hide",
			attr = element.attributes[attrName];

		if (attr && !isBinded(element, attrName)) {
			element.style.display = "";

			if (getValue(attr.value, data))
				element.style.display = "none";

			BINDED.push({
				element: element,
				attr: attrName
			});
		}
	}

	function vShow(element, data) {
		var attrName = "v-show",
			attr = element.attributes[attrName];

		if (attr && !isBinded(element, attrName)) {
			element.style.display = "none";

			if (getValue(attr.value, data))
				element.style.display = "";

			BINDED.push({
				element: element,
				attr: attrName
			});
		}
	}

	function vEnabled(element, data) {
		var attrName = "v-enabled",
			attr = element.attributes[attrName];

		if (attr && !isBinded(element, attrName)) {
			disable(element);

			if (getValue(attr.value, data))
				enable(element);

			BINDED.push({
				element: element,
				attr: attrName
			});
		}
	}

	function vDisabled(element, data) {
		var	attrName = "v-disabled",
			attr = element.attributes[attrName];

		if (attr && !isBinded(element, attrName)) {
			enable(element);

			if (getValue(attr.value, data))
				disable(element);

			BINDED.push({
				element: element,
				attr: attrName
			});
		}
	}

	function isBinded(element, attr) {
		for (var i = 0; i < BINDED.length; i++)
			if (element === BINDED[i].element && attr === BINDED[i].attr)
				return true;
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
