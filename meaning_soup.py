# other resources: 
# https://www.miso.co.kr/Resource/Hanja
# http://kangname.com/pages/hanja.php
from bs4 import BeautifulSoup
import urllib3
http = urllib3.PoolManager()
import io
from urllib.parse import quote
import json
import os

# https://realpython.com/python-web-scraping-practical-introduction/

hangul = [
    [*'가각간갈감갑강개객갱갹거건걸검겁게격견결겸경계고곡곤골공곶과곽관괄광괘괴굉교구국군굴궁권궐궤귀규균귤극근글금급긍기긴길김끽'],
    [*'나낙난날남납낭내녀년념녕노농뇌뇨눈눌뉴능니닉'],
    [*'다단달담답당대댁덕도독돈돌동두둔둘득등'],
    [*'라락란랄람랍랑래랭략량려력련렬렴렵령례로록론롱뢰료룡루류륙륜률륭륵름릉리린림립'],
    [*'마막만말망매맥맹멱면멸명몌모목몰몽묘무묵문물미민밀'],
    [*'박반발방배백번벌범법벽변별병보복본볼봉부북분불붕비빈빙'],
    [*'사삭산살삼삽상새색생서석선설섬섭성세소속손솔송쇄쇠수숙순술숭쉬슬습승시식신실심십쌍씨'],
    [*'아악안알암압앙애액앵야약양어억언얼엄업엔여역연열염엽영예오옥온올옹와완왈왕왜외요욕용우욱운울웅원월위유육윤율융은을음읍응의이익인일임입잉'],
    [*'자작잔잠잡장재쟁저적전절점접정제조족존졸종좌죄주죽준줄중즉즐즙증지직진질짐집징'],
    [*'차착찬찰참창채책처척천철첨첩청체초촉촌총촬최추축춘출충췌취측층치칙친칠침칩칭'],
    [*'쾌'],
    [*'타탁탄탈탐탑탕태택탱터토통퇴투특틈'],
    [*'파판팔패팽퍅편폄평폐포폭표품풍피필핍'],
    [*'하학한할함합항해핵행향허헌헐험혁현혈혐협형혜호혹혼홀홍화확환활황회획횡효후훈훙훤훼휘휴휼흉흑흔흘흠흡흥희힐']
]

"""
# scrape the hangul options first
for i in range(14):
    url = "https://hanjasajun.co.kr/name.php?c=" + str(i+1)
    page = http.request("GET", url, retries=20)
    html = page.data
    soup = BeautifulSoup(html, "html.parser")
    print(soup.find_all("div", {"class": "panel-body"})[0].get_text())
"""

meaning = {}
if os.path.isfile("meanings.json"):
    f = open("meanings.json", encoding="utf8")
    meaning = json.load(f)
    f.close()

for o in range(14):
    for j in hangul[o]:
        if j in meaning.keys():
            print(f"{j} already in the meaning json. Skipping.")
        else:
            k = 1
            while True:
                url = "https://hanjasajun.co.kr/name.php?p=" + str(k) + "&c=" + str(o+1) + "&s=" + quote(j)
                print(f"New iteration for {url}.")
                # https://urllib3.readthedocs.io/en/stable/user-guide.html
                # need to use urllib3 for retries.
                page = http.request("GET", url, retries=20)
                html = page.data
                soup = BeautifulSoup(html, "html.parser")
                res = soup.find_all("div", {"class": "panel-body"})[1].get_text()
                raw = res.split("\n")
                
                if len(raw) <= 8:
                    print(f">> breaking for {raw}")
                    break
                
                for i in range(3, len(raw), 6):
                    print(">>", raw[i+2], "||", raw[i+3])
                    if "‹" in raw[i] or "‹" in raw[i+1] or "‹" in raw[i+2] or "‹" in raw[i+3]:
                        print(">> We hit the end of the scrape. Skipping.")
                    else:
                        base = raw[i+2].split(" ")
                        base = list(map(lambda x: x.strip(), base))
                        if not base[-1] in meaning.keys():
                            meaning[base[-1]] = []
                        meaning[base[-1]].append(" ".join(base[:-1]))
                        print(f">> found base. mapped {base[-1]} to {' '.join(base[:-1])}")
                        m = list(map(lambda x: x.strip(), raw[i+3].split(";")))
                        meaning[base[-1]].extend(m)
                k += 1
                # Writing to b.json
            with open("meanings.json", "w", encoding="utf8") as outfile:
                print("> Dumping the current object.")
                json.dump(meaning,outfile,ensure_ascii=False)
# print(soup.find("table").get_text())


