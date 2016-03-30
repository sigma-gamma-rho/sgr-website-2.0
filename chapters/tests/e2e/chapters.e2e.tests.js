'use strict';

describe('Chapters E2E Tests:', function () {
  describe('Test chapters page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/chapters');
      expect(element.all(by.repeater('chapter in chapters')).count()).toEqual(0);
    });
  });
});
