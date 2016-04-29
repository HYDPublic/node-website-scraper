require('should');
var utils = require('../../lib/utils');
var Resource = require('../../lib/resource');

describe('Common utils', function () {
	describe('#isUrl(url)', function () {
		it('should return true if url starts with "http[s]://"', function () {
			utils.isUrl('http://google.com').should.be.true();
			utils.isUrl('https://github.com').should.be.true();
		});
		it('should return true if url starts with "//"', function () {
			utils.isUrl('//www.youtube.com').should.be.true();
		});
		it('should return false if url starts neither with "http[s]://" nor "//"', function () {
			utils.isUrl('http//www.youtube.com').should.be.false();
			utils.isUrl('http:/www.youtube.com').should.be.false();
			utils.isUrl('htt://www.youtube.com').should.be.false();
			utils.isUrl('://www.youtube.com').should.be.false();
			utils.isUrl('www.youtube.com').should.be.false();
		});
	});

	describe('#getUrl(url, path)', function () {
		it('should return url + path if path is not url', function () {
			utils.getUrl('http://google.com', '/path').should.be.equal('http://google.com/path');
			utils.getUrl('http://google.com/qwe/qwe/qwe', '/path').should.be.equal('http://google.com/path');
			utils.getUrl('http://google.com?kjrdrgek=dmskl', '/path').should.be.equal('http://google.com/path');
		});
		it('should return path if it is url', function () {
			utils.getUrl('http://google.com', 'http://my.site.com/').should.be.equal('http://my.site.com/');
			utils.getUrl('http://google.com/qwe/qwe/qwe', '//my.site.com').should.be.equal('http://my.site.com/');
		});
		it('should use the protocol from the url, if the path is a protocol-less url', function (){
			utils.getUrl('http://my.site.com', '//cdn.com/library.js').should.be.equal('http://cdn.com/library.js');
			utils.getUrl('https://my.site.com', '//cdn.com/library.js').should.be.equal('https://cdn.com/library.js');
		});
	});

	describe('#getUnixPath(path)', function () {
		it('should convert to unix format for windows', function () {
			utils.getUnixPath('D:\\Projects\\node-website-scraper').should.be.equal('D:/Projects/node-website-scraper');
		});
		it('should return unconverted path for unix', function () {
			utils.getUnixPath('/home/sophia/projects/node-website-scraper').should.be.equal('/home/sophia/projects/node-website-scraper');
		});
	});

	describe('#getFilenameFromUrl(url)', function () {
		it('should return last path item as filename & trim all after first ? or #', function () {
			utils.getFilenameFromUrl('http://example.com/index.html').should.be.equal('index.html');
			utils.getFilenameFromUrl('http://example.com/p/a/t/h/index.html').should.be.equal('index.html');
			utils.getFilenameFromUrl('http://example.com/index.html?12').should.be.equal('index.html');
			utils.getFilenameFromUrl('http://example.com/index.html#t?12').should.be.equal('index.html');
			utils.getFilenameFromUrl('http://example.com/index.html?12#t').should.be.equal('index.html');
			utils.getFilenameFromUrl('http://example.com/?12_jdlsk').should.be.empty();
			utils.getFilenameFromUrl('http://example.com/#index.html').should.be.empty();
			utils.getFilenameFromUrl('http://example.com/').should.be.empty();
		});
		it('should return unconvetred filename if there are no ?,#', function () {
			utils.getFilenameFromUrl('index.html').should.be.equal('index.html');
		});
	});

	describe('#getHashFromUrl', function () {
		it('should return hash from url', function () {
			utils.getHashFromUrl('#').should.be.equal('#');
			utils.getHashFromUrl('#hash').should.be.equal('#hash');
			utils.getHashFromUrl('page.html#hash').should.be.equal('#hash');
			utils.getHashFromUrl('http://example.com/page.html#hash').should.be.equal('#hash');
		});

		it('should return empty string if url doesn\'t contain hash', function () {
			utils.getHashFromUrl('').should.be.equal('');
			utils.getHashFromUrl('page.html?a=b').should.be.equal('');
			utils.getHashFromUrl('http://example.com/page.html?a=b').should.be.equal('');
		});
	});

	describe('#getRelativePath', function () {
		it('should return relative path', function () {
			utils.getRelativePath('css/1.css', 'img/1.png').should.be.equal('../img/1.png');
			utils.getRelativePath('index.html', 'img/1.png').should.be.equal('img/1.png');
			utils.getRelativePath('css/1.css', 'css/2.css').should.be.equal('2.css');
		});
	});

	describe('#createOutputObject', function () {
		it('should create output object recursively', function() {
			var root = new Resource('http://google.com', 'google.html');
			root.createChild('http://child-one.com', 'child.html');
			root.createChild('http://child-two.com', 'child2.html');

			var expected = {
				url: 'http://google.com',
				filename: 'google.html',
				assets: [{
					url: 'http://child-one.com',
					filename: 'child.html',
					assets: []
				}, {
					url: 'http://child-two.com',
					filename: 'child2.html',
					assets: []
				}]
			};

			var result = utils.createOutputObject(root);
			result.should.eql(expected);
		});

		it('should not fail on referential loop', function() {
			var root = new Resource('http://example.com', 'index.html');
			var child1 = root.createChild('http://child-one.com', 'child1.html');
			var child2 = root.createChild('http://child-two.com', 'child2.html');
			// create referential loop
			var rootCopy = child1.createChild('http://example.com');
			child1.updateChild(rootCopy, root);

			var result = utils.createOutputObject(root);
			result.should.be.not.empty();
		});
	});
});
