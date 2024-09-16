const express = require("express");
const {
  getUsersInfo,
  updateLoginStatus,
  getBooks,
  getBookmark,
  getLoginInfo,
  setBookmark,
} = require("./supabase");
const { ErrMsgDefine } = require("./errMsgDefine");

const app = express();
const cors = require("cors");
const port = 3000;

// 環境変数の取得に必要
require("dotenv").config();

// 通信を許可するクライアントの設定
const corsOptions = {
  origin: process.env.EXPRESS_CORS_URL,
};

// クライアントからのリクエストを許可するために必要
app.use(cors(corsOptions));
// req.bodyを解析するために必要
app.use(express.json());

// ログイン時
app.put("/login", async (req, res) => {
  // リクエスト情報取得
  const { userId, password } = req.body;

  console.log("[ユーザーID]: " + userId);
  console.log("[パスワード]:" + password);

  // ユーザー管理テーブルのデータを取得
  const userInfo = await getUsersInfo(userId, password);

  // 送信データ定義
  const sendData = {
    userId: "",
    loginStatus: false,
    errMsg: "",
  };

  // ユーザー管理テーブルにアカウントが存在する場合
  if (userInfo.length > 0) {
    // ログイン状態チェック
    if (userInfo.status) {
      // 「既にログインされています。」
      console.log(ErrMsgDefine.ERROR_MESSAGE_02);
      // 送信データにエラーメッセージを設定
      sendData.errMsg = ErrMsgDefine.ERROR_MESSAGE_02;

      res.send(sendData);
    }

    // ログイン状態を更新
    const loginStatus = await updateLoginStatus(userInfo[0].userId, true);

    // 送信データを設定
    sendData.id = userInfo[0].id;
    sendData.userId = userInfo[0].userId;
    sendData.loginStatus = loginStatus;

    // 送信
    res.send(sendData);
  }
  // ユーザー管理テーブルにアカウントが存在しない場合
  else {
    // 「ユーザーIDまたは、パスワードが間違っています。」
    console.log(ErrMsgDefine.ERROR_MESSAGE_01);

    // 送信データにエラーメッセージを設定
    sendData.errMsg = ErrMsgDefine.ERROR_MESSAGE_01;

    // 送信
    res.send(sendData);
  }
});

// ログアウト時
app.put("/logout", async (req, res) => {
  // リクエスト情報取得
  const { userId } = req.body;

  console.log("[ログアウト]");
  console.log("ユーザーID: " + userId);

  // ログアウト
  await updateLoginStatus(userId, false);

  const sendData = {
    loginStatus: false,
    errMsg: "",
  };

  // 送信
  res.send(sendData);
});

// 書籍一覧取得
app.get("/book-list/:userId", async (req, res) => {
  const { userId } = req.params;

  // 送信データ定義
  const sendData = {
    books: [],
    errMsg: "",
  };

  // ログイン中ではない場合
  const status = await getLoginInfo(userId);
  if (!status) {
    // 送信データを設定
    sendData.errMsg = ErrMsgDefine.ERROR_MESSAGE_03;

    // 送信
    res.send(sendData);
    return;
  }

  // bookmarkテーブルからデータ取得
  const bookmarks = await getBookmark(userId);

  // booksテーブルからデータ取得
  const books = await getBooks();

  // ブックマークを設定
  books.forEach((book) => {
    bookmarks.forEach((bookmark) => {
      if (bookmark.bookId == book.id) {
        book.star = true;
      } else {
        book.star = false;
      }
    });
  });

  // 送信データを設定
  sendData.books = books;

  // 送信
  res.send(sendData);
});

// お気に入り登録
app.put("/favorite", async (req, res) => {
  const { userId, bookId } = req.params;
  console.log(userId);
  console.log(bookId);

  // 送信データ定義
  const sendData = {
    errMsg: "",
  };

  // ブックマーク登録
  await setBookmark(userId, bookId);

  res.send(sendData);
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
