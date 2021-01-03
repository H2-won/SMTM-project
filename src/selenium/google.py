import os
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import time
import urllib.request

driver = webdriver.Chrome()
nameList = ['플로우식', '딘',
            '타이거jk', '비지', '개코', '최자', '넉살', '조우찬', '주노플로', '블랙나인', '우디고차일드', '피타입', '슬리피', '코드쿤스트', '딥플로우',
            '창모', '나플라', '쿠기', 'ph-1', '래퍼 EK', '래퍼 차붐', '디아크', '키드밀리', '칠린호미', '윤비', '노엘', '래퍼 odee', '릴타치', '뉴챔프', '디보',
            '밀릭', '보이콜드', '류정란', '래원', '먼치맨', '스월비', '콕스빌리', '맥대디', '윤훼이', '타쿠와', '마미손', '휘민', '그루비룸 규정', '저스디스', '꽈뚜룹',
            '스카이민혁', '래퍼 미란이', '원슈타인', '쿤디판다', '래퍼 그레이']
for name in nameList:
    driver.get("https://www.google.co.kr/imghp?hl=en-GB&tab=ri&ogbl")
    elem = driver.find_element_by_name("q")
    elem.send_keys(name)
    elem.send_keys(Keys.RETURN)
    os.mkdir('C:/Users/woosi/Documents/GitHub/SMTM-project/src/selenium/img/' + name)


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
                imgUrl, "C:/Users/woosi/Documents/GitHub/SMTM-project/src/selenium/img/" + name + "/" + str(count) + ".jpg")
            count = count + 1
        except:
            pass

driver.close()
