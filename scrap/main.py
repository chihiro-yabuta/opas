from driver import Driver

d = Driver(1)
try:
    d.open()
    metaId = d.slct('optDaiGenre')
    cdId = d.slct('optSyoGenre')
    data = d.tbl()
except Exception as e:
    print(e)
finally:
    d.quit()

for k, v in data.items():
    if v:
        base = f'https://reserve.opas.jp/{k}/menu/Login.cgi?action=FROM_PORTAL_TO_CALENDAR'
        key = ''.join(map(lambda e: f'&checkMeisaiUniqKey={e}', v))
        cd = f'&shubetsuCd={cdId}'
        meta = f'&metaShubetsuCd={metaId}'
        print(base + key + cd + meta)