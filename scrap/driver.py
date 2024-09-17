import re, os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.select import Select

class Driver:
    def __init__(self, genreIdx):
        self.genreIdx = genreIdx
        self.driver = webdriver.Remote(
            command_executor = os.environ['SELENIUM_URL'],
            options = webdriver.FirefoxOptions(),
        )

    def open(self):
        self.driver.get('https://reserve.opas.jp/portal/menu/Welcome.cgi')
        self.driver.find_element(by=By.CLASS_NAME, value='pngfix').click()

    def quit(self):
        self.driver.quit()

    def slct(self, name):
        slct = Select(self.driver.find_element(by=By.NAME, value=name))
        value = slct.options[self.genreIdx].get_attribute('value').split('_')[0]
        slct.select_by_index(self.genreIdx)
        return value

    def tbl(self):
        m = {}
        for i in range(len(self.tbls())):
            e = self.tbls()[i]
            if e.get_attribute('onmouseover'):
                e.click()
                src = e.find_elements(by=By.TAG_NAME, value='img')[1].get_attribute('src')
                self.footer('rfooter')
                self.tr()
                id = re.sub(r'^img_|\.gif$', '', os.path.basename(src))
                m[id] = []
                for e in self.driver.find_elements(by=By.NAME, value='checkShisetsuUniqKey'):
                    m[id].append(e.get_attribute('value'))
                self.footer('lfooter')
                self.tbls()[i].click()
        return m

    def tbls(self):
        tbl = self.driver.find_element(by=By.TAG_NAME, value='table')
        return tbl.find_elements(by=By.TAG_NAME, value='td')

    def tr(self):
        tbl = self.driver.find_element(by=By.TAG_NAME, value='table')
        for e in tbl.find_elements(by=By.TAG_NAME, value='tr'):
            if e.get_attribute('onmouseover'):
                td = e.find_element(by=By.TAG_NAME, value='td')
                td.click()

    def footer(self, name):
        footer = self.driver.find_element(by=By.ID, value=name)
        footer.find_element(by=By.CLASS_NAME, value='pngfix').click()