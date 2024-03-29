# -*- coding: UTF-8 -*-

from flask import Flask, render_template, request, session, redirect, url_for
from log2file import Log
from dbcodes import *
import json
import os
from datetime import timedelta

app = Flask(__name__)
app.config['SECRET_KEY'] = 'this is secret key'
app.config['DEBUG'] = True
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = timedelta(seconds=1)

dbmanager = DBManager('onlineOJ', 'ComPro32API', 'localhost', 'root')

@app.route('/login', methods=["GET", "POST"])
def login():
    Log("进入login界面")

    if request.method == 'POST':
        Log("recieved POST")
        Log("session['LOGINED']:%s" % session.get('LOGINED'))
        if not session.get('LOGINED'):
            session['LOGINED'] = False
            username = request.form['username']
            psd = request.form['password']
            Log("user logined\nusename:%s\npassword:%s" % (username, psd))
            dbmanager.m_useTable('Customers')
            if not dbmanager.m_itemExists(['username, psd'], 'username="%s" AND psd="%s"' % (username, psd)):
                Log("登录失败")
                return render_template('login.html', loginfailed=False)
            else:
                Log("登录成功")
                session['LOGINED'] = True
                return redirect(url_for('homepage'))

    return render_template('login.html')


@app.route("/signup", methods=['GET', 'POST'])
def signup():
    Log("进入signup界面")
    if request.method == 'POST':
        username = request.form['username']
        psd = request.form['password']
        Log("用户注册,username:%s, psd:%s" % (username, psd))
        dbmanager.m_useTable("Customers")
        if dbmanager.m_itemExists(['username', 'psd'], where="username='%s' AND psd='%s'" % (username, psd)):
            Log("用户已经存在")
            return render_template("signup.html", signuped=False)
        session['LOGINED'] = True
        dbmanager.m_insertItem([username, psd, 'NONE', 0, 0, 0])
        Log("增加用户了")
        return redirect(url_for("questions"))
    return render_template("signup.html", signuped=True)


@app.route("/admin", methods=['POST', 'GET'])
def admin():
    Log("进入管理员界面")
    dbmanager.m_useTable("Customers")
    cust_name = dbmanager.m_selectItem(['username', "psd"])
    dbmanager.m_useTable("Questions")
    quest_name = dbmanager.m_selectItem(['name'])
    return render_template("admin.html", questions=quest_name, customers=cust_name)


@app.route("/admin/deleteCustom/<name>", methods=['POST'])
def deleteCustom(name):
    dbmanager.logOn()
    dbmanager.m_useTable("Customers")
    dbmanager.m_deleteItem("username='%s'" % name)
    Log("删除了用户:%s" % name)
    return redirect(url_for('admin'))


@app.route("/admin/deleteQuestion/<name>", methods=['POST'])
def deleteQuestion(name):
    dbmanager.logOn()
    dbmanager.m_useTable("Questions")
    jsonfile = dbmanager.m_selectItem(["Tpath"], where="name='%s'" % name)[0][0]
    #print(jsonfile)
    #os.remove(url_for('static', filename="questions/%s" % jsonfile))
    os.remove("./static/questions/%s" % jsonfile)
    dbmanager.m_deleteItem("name='%s'" % name)
    Log("删除了题目:%s" % name)
    return redirect(url_for('admin'))

@app.route("/admin/changeQuestion/<name>", methods=['GET', 'POST'])
def changeQuestion(name):
    return "change! %s" % name


@app.route("/questions")
def questions():
    Log("进入题目列表")
    dbmanager.m_useTable("Questions")
    questions = dbmanager.m_selectItem(where="checked=1")
    return render_template("QuestionBank.html",questions=questions)


@app.route("/question/<Qname>")
def writeQuestion(Qname):
    Log("进入写题界面，题目：%s" % Qname)
    dbmanager.logOn()
    dbmanager.m_useTable("Questions")
    Tpath = dbmanager.m_selectItem(['Tpath'], where="name='%s'" % Qname)[0]
    global jsonfile
    try:
        jsonfile = open("./static/questions/%s" % Tpath,encoding='UTF-8')
    except IOError:
        Log("没有这个文件:%s" % Tpath)
    file = json.load(jsonfile)
    print(file['Context'])
    #return render_template("Answer.html", name=Qname, context=file['Context'])
    return render_template("Answer.html")


@app.route('/addedQuestion', methods=["POST"])
def addedQuestion():
    Log("用户对题目进行修改了")
    if not session.get('QUESTION'):
        session['QUESTION'] = {'Context': request.form['context'], 'Text': [{'Context': request.form['test'], 'Answer': request.form['result']}]}
        jsontext = json.dumps(session['QUESTION'])
        filename = request.form['name'] + ".json"
        with open('./static/questions/' + filename, "w+") as file:
            file.write(jsontext)
        dbmanager.m_useTable('Questions')
        dbmanager.m_insertItem([request.form['name'], 0, 0, request.form['type'], filename, 0])
    return redirect(url_for('release'))


@app.route("/competition", methods=['GET'])
def competition():
    Log("进入比赛界面")
    return render_template("TopicList.html")


@app.route('/release')
def release():
    Log("进入Release页面")
    return render_template('Release.html')


@app.route('/', methods=['GET'])
def homepage():
    Log("进入主页")
    if not session.get('LOGINED'):
        session['LOGINED'] = False
    return render_template('index.html')


if __name__ == '__main__':
    app.run(debug=True)
