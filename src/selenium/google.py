import os
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import time
import urllib.request

driver = webdriver.Chrome()
nameList = ['래퍼 지구인']
for name in nameList:
    driver.get("https://www.google.co.kr/imghp?hl=en-GB&tab=ri&ogbl")
    elem = driver.find_element_by_name("q")
    elem.send_keys(name)
    elem.send_keys(Keys.RETURN)
    os.mkdir('D:/SMTM Project/' + name)


# 스크롤 다운 하여 더 많은 이미지 다운로드 */

    SCROLL_PAUSE_TIME = 1

    last_height = driver.execute_script("return document.body.scrollHeight")

    while True:
        driver.execute_script(
            "window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(SCROLL_PAUSE_TIME)
        new_height = driver.execute_script("return document.body.scrollHeight")
        if new_height == last_height:
            break
        last_height = new_height

# /*#

    images = driver.find_elements_by_css_selector(".rg_i.Q4LuWd")
    count = 1
    for image in images:
        try:
            image.click()
            time.sleep(2)
            imgUrl = driver.find_element_by_xpath(
                '/html/body/div[2]/c-wiz/div[3]/div[2]/div[3]/div/div/div[3]/div[2]/c-wiz/div[1]/div[1]/div/div[2]/a/img').get_attribute("src")
            urllib.request.urlretrieve(
                imgUrl, "D:/SMTM Project/" + name + "/" + str(count) + ".jpg")
            count = count + 1
        except:
            pass

driver.close()
