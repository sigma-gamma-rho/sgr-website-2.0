'use strict';

describe('Rssfeeds E2E Tests:', function () {
  describe('Test Rssfeeds page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/rssfeeds');
      expect(element.all(by.repeater('rssfeed in rssfeeds')).count()).toEqual(0);
    });
  });
});
