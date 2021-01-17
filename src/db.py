import sqlite3


def dbcon():
    return sqlite3.connect('db.db')


def createTable():
    try:
        db = dbcon()
        c = db.cursor()
        c.execute(
            "CREATE TABLE rapdes (name varchar(10), description varchar(100))")
    except Exception as e:
        print('db error', e)
    finally:
        db.close()


def insertData(name, description):
    try:
        db = dbcon()
        c = db.cursor()
        setdata = (name, description)
        c.execute("INSERT INTO rapdes VALUES (?, ?)", setdata)
        db.commit()
    except Exception as e:
        print('db error', e)
    finally:
        db.close()


def selectAll():
    d = tuple()
    try:
        db = dbcon()
        # db.row_factory = dicFactoryy
        db.row_factory = lambda cursor, row: {row[0], row[1]}
        c = db.cursor()
        c.execute('SELECT * FROM rapdes')
        d = c.fetchall()
    except Exception as e:
        print('db error', e)
    finally:
        db.close()
        print(d)
        return d


# selectAll()


def selectName(name):
    ret = ()
    try:
        db = dbcon()
        c = db.cursor()
        setdata = (name,)
        c.execute('SELECT * FROM rapdes WHERE name = ?', setdata)
        ret = c.fetchone()
    except Exception as e:
        print('db error', e)
    finally:
        db.close()
        return ret


def selectAlls():
    def dictFactory(cursor, row):
        d = {}
        for idx, col in enumerate(cursor.description):
            d[col[0]] = row[idx]
        return d

    db = dbcon()
    db.row_factory = dictFactory
    c = db.cursor()
    c.execute("select * from rapdes")
    a = c.fetchall()
    return a
    # t = t(a.item())
    # print(t)
    # return t

    # return c.fetchall()


selectAlls()


def dicFactoryy():
    def dictFactory(cursor, row):
        d = {}
        for idx, col in enumerate(cursor.description):
            d[col[0]] = row[idx]
        return d

    db = dbcon()
    db.row_factory = dictFactory
    c = db.cursor()
    for i in c.execute("select * from rapdes"):
        print(i)
        return i
    # print(c.fetchone())
    # return c.fetchone()


# dicFactoryy()


# def selectAll():
#     d = {}
#     try:
#         db = dbcon()
#         db.row_factory = dictFactory
#         c = db.cursor()
#         c.execute('SELECT * FROM rapdes')
#         d = c.fetchall()
#     except Exception as e:
#         print('db error', e)
#     finally:
#         db.close()
#         print(d)
#             return d


# selectAlls()
