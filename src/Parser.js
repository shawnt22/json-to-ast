import {tokenize, tokenTypes} from './tokenize';
import exceptionsDict from './exceptionsDict';
import position from './position';

const objectStates = {
	_START_: 0,
	OPEN_OBJECT: 1,
	KEY: 2,
	COLON: 3,
	VALUE: 4,
	COMMA: 5,
	CLOSE_OBJECT: 6
};

const arrayStates = {
	_START_: 0,
	OPEN_ARRAY: 1,
	VALUE: 2,
	COMMA: 3,
	CLOSE_ARRAY: 4
};

const defaultSettings = {
	verbose: true
};

export default class {
	constructor(source, settings) {
		this.settings = Object.assign(defaultSettings, settings);
		this.tokenList = tokenize(source);
		this.index = 0;

		let json = this._parseValue();

		if (json) {
			return json;
		} else {
			throw new SyntaxError(exceptionsDict.emptyString);
		}
	}

	_parseObject() {
		let startToken;
		let property;
		let object = {
			type: 'object',
			properties: []
		};
		let state = objectStates._START_;

		while (true) {
			let token = this.tokenList[this.index];

			switch (state) {
				case objectStates._START_:
					if (token.type === tokenTypes.LEFT_BRACE) {
						startToken = token;
						state = objectStates.OPEN_OBJECT;
						this.index ++;
					} else {
						return null;
					}
					break;

				case objectStates.OPEN_OBJECT:
					if (token.type === tokenTypes.STRING) {
						property = {
							type: 'property'
						};
						if (this.settings.verbose) {
							property.key = {
								type: 'key',
								position: token.position,
								value: token.value
							};
						} else {
							property.key = {
								type: 'key',
								value: token.value
							};
						}
						state = objectStates.KEY;
						this.index ++;
					} else if (token.type === tokenTypes.RIGHT_BRACE) {
						if (this.settings.verbose) {
							object.position = position(
								startToken.position.start.line,
								startToken.position.start.column,
								startToken.position.start.char,
								token.position.end.line,
								token.position.end.column,
								token.position.end.char
							);
						}
						this.index ++;
						return object;
					} else {
						return null;
					}
					break;

				case objectStates.KEY:
					if (token.type == tokenTypes.COLON) {
						state = objectStates.COLON;
						this.index ++;
					} else {
						return null;
					}
					break;

				case objectStates.COLON:
					let value = this._parseValue();

					if (value !== null) {
						property.value = value;
						object.properties.push(property);
						state = objectStates.VALUE;
					} else {
						return null;
					}
					break;

				case objectStates.VALUE:
					if (token.type === tokenTypes.RIGHT_BRACE) {
						if (this.settings.verbose) {
							object.position = position(
								startToken.position.start.line,
								startToken.position.start.column,
								startToken.position.start.char,
								token.position.end.line,
								token.position.end.column,
								token.position.end.char
							);
						}
						this.index ++;
						return object;
					} else if (token.type === tokenTypes.COMMA) {
						state = objectStates.COMMA;
						this.index ++;
					} else {
						return null;
					}
					break;

				case objectStates.COMMA:
					if (token.type === tokenTypes.STRING) {
						property = {
							type: 'property'
						};
						if (this.settings.verbose) {
							property.key = {
								type: 'key',
								position: token.position,
								value: token.value
							};
						} else {
							property.key = {
								type: 'key',
								value: token.value
							};
						}
						state = objectStates.KEY;
						this.index ++;
					} else {
						return null;
					}

			}

		}

	}

	_parseArray() {
		let startToken;
		let value;
		let array = {
			type: 'array',
			items: []
		};
		let state = arrayStates._START_;

		while (true) {
			let token = this.tokenList[this.index];

			switch (state) {
				case arrayStates._START_:
					if (token.type === tokenTypes.LEFT_BRACKET) {
						startToken = token;
						state = arrayStates.OPEN_ARRAY;
						this.index ++;
					} else {
						return null;
					}
					break;

				case arrayStates.OPEN_ARRAY:
					value = this._parseValue();

					if (value !== null) {
						array.items.push(value);
						state = arrayStates.VALUE;
					} else if (token.type === tokenTypes.RIGHT_BRACKET) {
						if (this.settings.verbose) {
							array.position = position(
								startToken.position.start.line,
								startToken.position.start.column,
								startToken.position.start.char,
								token.position.end.line,
								token.position.end.column,
								token.position.end.char
							);
						}
						this.index ++;
						return array;
					} else {
						return null;
					}
					break;

				case arrayStates.VALUE:
					if (token.type === tokenTypes.RIGHT_BRACKET) {
						if (this.settings.verbose) {
							array.position = position(
								startToken.position.start.line,
								startToken.position.start.column,
								startToken.position.start.char,
								token.position.end.line,
								token.position.end.column,
								token.position.end.char
							);
						}
						this.index ++;
						return array;
					} else if (token.type === tokenTypes.COMMA) {
						state = arrayStates.COMMA;
						this.index ++;
					} else {
						return null;
					}
					break;

				case arrayStates.COMMA:
					value = this._parseValue();
					if (value !== null) {
						array.items.push(value);
						state = arrayStates.VALUE;
					} else {
						return null;
					}
					break;
			}
		}
	}

	_parseValue() {
		// value: object | array | STRING | NUMBER | TRUE | FALSE | NULL
		let token = this.tokenList[this.index];
		let tokenType;

		switch (token.type) {
			case tokenTypes.STRING:
				tokenType = 'string';
				break;
			case tokenTypes.NUMBER:
				tokenType = 'number';
				break;
			case tokenTypes.TRUE:
				tokenType = 'true';
				break;
			case tokenTypes.FALSE:
				tokenType = 'false';
				break;
			case tokenTypes.NULL:
				tokenType = 'null';
		}

		let objectOrArray = (
			this._parseObject() ||
			this._parseArray()
		);

		if (tokenType !== undefined) {
			this.index ++;

			if (this.settings.verbose) {
				return {
					type: tokenType,
					value: token.value,
					position: token.position
				};
			} else {
				return {
					type: tokenType,
					value: token.value
				};
			}

		} else if (objectOrArray !== null) {
			return objectOrArray;

		} else {
			throw new Error('!!!!!');
		}
	}

}
