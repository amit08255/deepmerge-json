const assert = require('assert');
const merge = require('../dist');

const falsey = [undefined, null, false, 0, '0', NaN];

describe('basic merge', function () {
	it('should prefer pos values', function () {
		const pre = { a: 2 };
		const pos = { a: 1 };
		const res = merge(pre, pos);
		assert.strictEqual(res.a, pos.a)
	});

	it('should create new values', function () {
		const pre = {};
		const pos = { a: 2 };
		const res = merge(pre, pos);
		assert.strictEqual(res.a, pos.a)
	});

	it('should merge all basic types', function () {
		const pre = { boolValue: false, numberValue: 100, stringValue: 'pre' };
		const pos = { boolValue: true, numberValue: 222, stringValue: 'pos' };
		const res = merge(pre, pos);
		assert.deepStrictEqual(res, pos);
	});

	it('should return a clone', function () {
		const pre = { boolValue: false, numberValue: 100, stringValue: 'pre' };
		const pos = { boolValue: true, numberValue: 222, stringValue: 'pos' };
		const res = merge(pre, pos);

		assert.notStrictEqual(res, pre);
		assert.notStrictEqual(res, pos);
	});

	it('should replace an empty pre parameter', function () {
		const pos = { foo: 20, bar: 'baz' };
		falsey.forEach(f => {
			const res = merge(f, pos);
			assert.deepStrictEqual(res, pos);
		});
	});

	it('should accept an empty pos parameter', function () {
		const pre = { foo: 20, bar: 'baz' };
		falsey.forEach(f => {
			const res = merge(pre, f);
			assert.deepStrictEqual(res, f);
		});
	});

	it('should accept an empty value for both parameters', function () {
		falsey.forEach(f => {
			const res = merge(f, f);
			assert.deepStrictEqual(res, f);
		});
	});
});


describe('object merge', function () {
	it('should deeply copy objects', function () {
		const pre = { a: '@', b: { c: 1, d: { e: 2, f: { g: 3, h: { i: 4, l: '$' } } } } };
		const pos = { b: { c: 10, d: { e: 20, f: { g: 30, h: { i: 40, j: { k: 50 } } } } } };
		const res = merge(pre, pos);
		assert.deepStrictEqual(res, {
			a: '@', b: { c: 10, d: { e: 20, f: { g: 30, h: { i: 40, j: { k: 50 }, l: '$' } } } }
		});
	});

	it('should deeply replace objects', function () {
		const pre = { a: { b: { c: 1 }, c: 1, d: 1 } };
		const pos = { a: { b: 10, c: { d: 20 } } };
		const res = merge(pre, pos);
		assert.deepStrictEqual(res, { a: { b: 10, c: { d: 20 }, d: 1 } });
	});
});


describe('simple array merge', function () {
	it('should prefer pos values', function () {
		const pre = [1, 2, 3];
		const pos = [10, 20, 30];
		const res = merge(pre, pos);
		assert.deepStrictEqual(res, [10, 20, 30]);
	});

	it('should increase array size', function () {
		const pre = [1, 2, 3];
		const pos = [10, 20, 30, 40, 50];
		const res = merge(pre, pos);
		assert.deepStrictEqual(res, [10, 20, 30, 40, 50]);
	});

	it('should replace elements in order', function () {
		const pre = [1, 2, 3, 4, 5];
		const pos = [10, 20];
		const res = merge(pre, pos);
		assert.deepStrictEqual(res, [10, 20, 3, 4, 5]);
	});

	it('should support a pre empty array', function () {
		const pre = [];
		const pos = [10, 20, 30, 40];
		const res = merge(pre, pos);
		assert.deepStrictEqual(res, [10, 20, 30, 40]);
	});

	it('should support a pos empty array', function () {
		const pre = [1, 2, 3, 4];
		const pos = [];
		const res = merge(pre, pos);
		assert.deepStrictEqual(res, [1, 2, 3, 4]);
	});

	it('should support empty arrays', function () {
		const pre = [];
		const pos = [];
		const res = merge(pre, pos);
		assert.deepStrictEqual(res, []);
	});

	it('should skip empty values', function () {
		const pre = [1, 2, 3, 4];
		const pos = [10, , 30];
		const res = merge(pre, pos);
		assert.deepStrictEqual(res, [10, 2, 30, 4]);
	});

	it('should return a clone', function () {
		const pre = [0, 1, 2];
		const pos = [10, 20, 30];
		const res = merge(pre, pos);

		assert.notStrictEqual(res, pre);
		assert.notStrictEqual(res, pos);
	});
});


describe('complex array merge', function () {
	it('should append when requested', function () {
		const pre = [1, 2, 3];
		const pos = { $append: [10, 20, 30] };
		const res = merge(pre, pos);

		assert.deepStrictEqual(res, [1, 2, 3, 10, 20, 30]);
		assert.notEqual(res, pre);
		assert.notEqual(res, pos);
	});

	it('should prepend when requested', function () {
		const pre = [1, 2, 3];
		const pos = { $prepend: [10, 20, 30] };
		const res = merge(pre, pos);

		assert.deepStrictEqual(res, [10, 20, 30, 1, 2, 3]);
		assert.notEqual(res, pre);
		assert.notEqual(res, pos);
	});

	it('should replace when requested', function () {
		const pre = [1, 2, 3];
		const pos = { $set: [10, 20, 30] };
		const res = merge(pre, pos);

		assert.deepStrictEqual(res, [10, 20, 30]);
		assert.notEqual(res, pre);
		assert.notEqual(res, pos);
	});

	it('should replace by a unparameterized object', function () {
		const pre = { a: [1, 2, 3] };
		const pos = { a: { b: [10, 20, 30] } };
		const res = merge(pre, pos);

		assert.deepStrictEqual(res, pos);
		assert.notEqual(res, pre);
		assert.notEqual(res, pos);
	});
});