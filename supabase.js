require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = process.env.EXPRESS_SUPABASE_URL;
const supabaseKey = process.env.EXPRESS_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * ユーザー情報取得
 * @param {string} userId ユーザーID
 * @param {string} password パスワード
 * @returns ユーザーIDとパスワードに一致するユーザー情報
 */
module.exports.getUsersInfo = async (userId, password) => {
  let { data: users, error } = await supabase
    .from("users")
    .select("*")
    .eq("userId", userId)
    .eq("password", password);

  if (error) {
    console.log(error);
  }

  return users;
};

/**
 * ログイン状態更新
 * @param {string} userId ユーザーID
 */
module.exports.updateLoginStatus = async (userId, status) => {
  const { data, error } = await supabase
    .from("users")
    .update({ status })
    .eq("userId", userId)
    .select("status");

  if (error) {
    console.log(error);
  }

  return data[0].status;
};

module.exports.getLoginInfo = async (userId) => {
  const { data, error } = await supabase
    .from("users")
    .select("status")
    .eq("userId", userId);

  if (error) {
    console.log(error);
  }

  console.log(data);

  return data[0].status;
};

/**
 * 書籍一覧取得
 * @returns 書籍一覧
 */
module.exports.getBooks = async () => {
  let { data: books, error } = await supabase.from("books").select("*");

  if (error) {
    console.log(error);
  }

  return books;
};

module.exports.getBookmark = async (userId) => {
  let { data: bookmarks, error } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("userId", userId);

  if (error) {
    console.log(error);
  }

  return bookmarks;
};

module.exports.setBookmark = async (userId, bookId) => {
  const { data: bookmarks, error } = await supabase
    .from("bookmarks")
    .insert({ userId, bookId })
    .select();
};
