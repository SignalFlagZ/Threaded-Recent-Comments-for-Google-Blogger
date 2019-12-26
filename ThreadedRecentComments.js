//	Threaded Recent Comments JQuery Plugin Ver.2.30
//	Google Blogger用 最近のコメント表示 
//						Copyright 2014-2018 Signal Flag "Z"
(function ($) {
	$.fn.ThreadedRecentComments = function (options) {
		var version = "2.30";
		var powered = "Threaded Recent Comments Ver." + version + " by <a href='https://signal-flag-z.blogspot.com/'>Signal Flag Z</a>";
		if (!options.yourURL) {
			this.html('Set yourURL.');
			return;
		}
		var defaults = {
			itemCount: 5,
			daysNew: 7,
			isMobile: false,
			feedURL: options.yourURL + "feeds/comments/default",
			timeout: 15000
		};
		options = jQuery.extend(defaults, options);
		var settings = jQuery.extend(options, { ajaxData: { 'alt': 'json-in-script', 'max-results': options.itemCount } });
		if (settings.itemCount > 150) {
			settings.itemCount = 150;
		}

		var results = {};
		results.jQThis = this;
		return this.each(function () {
			TRC_GetRssFeed(results);
		});



		function TRC_GetRssFeed(results) {
			jQuery.ajax({
				timeout: settings.timeout,
				url: settings.feedURL,
				data: settings.ajaxData,
				dataType: 'jsonp'
			}).done(function (data, textStatus, jqXHR) {
				results.json = data;
				results.CommList = TRC_makeCommentsArray(results);
				results.html = TRC_buildThreadedRecentCommments(results);
			}).fail(function (jqXHR, textStatus, errorThrown) {
				var err = "";
				switch (textStatus) {
					case 'parsererror':
						err = 'Requested JSON parse failed.';
						break;
					case 'timeout':
						err = 'Time out error.';
						break;
					case 'abort':
						err = 'Request aborted.';
						break;
					default:
						err = 'Uncaught Error.';
						break;
				}
				results.html = err;
			}).always(function (data, textStatus) {
				jQuery(results.jQThis).html(results.html);
				setCSS();
			});
		}

		function setCSS() {
			if (settings.cssTRC != void (0)) {
				jQuery('.ThreadedRecentComments').css(settings.cssTRC);
			}
			if (settings.cssPostTitle != void (0)) {
				jQuery('.ThreadedRecentComments  .postTitle').css(settings.cssPostTitle);
			}
			if (settings.cssCommentThread != void (0)) {
				jQuery('.ThreadedRecentComments  .commentThread').css(settings.cssCommentThread);
			}
			if (settings.cssParentPostedby != void (0)) {
				jQuery('.ThreadedRecentComments .parent .postedby').css(settings.cssParentPostedby);
			}
			if (settings.cssChildPostedby != void (0)) {
				jQuery('.ThreadedRecentComments .child .postedby').css(settings.cssChildPostedby);
			}
			if (settings.cssParentCommentBaloon != void (0)) {
				jQuery('.ThreadedRecentComments .parent  .commentBaloon').css(settings.cssParentCommentBaloon);
			}
			if (settings.cssChildCommentBaloon != void (0)) {
				jQuery('.ThreadedRecentComments .child .commentBaloon').css(settings.cssChildCommentBaloon);
			}
		}

		function TRC_makeCommentsArray(results) {
			var CommList = {};	//表示用コメントリスト
			//↓JSONフィード取得
			jQuery(results.json.feed.entry).each(function (count) {
				var D = "";		//日時変換用一時変数
				var IsPage = false;	//ページか？
				var CommID = this.id.$t.match(/[0-9]*$/);	//コメントID 文末の数字
				if (CommID != null) {
					CommID = CommID[0];
				} else {
					CommID = "";
				}
				if ('thr$in-reply-to' in this) { //記事がある場合
					var entryID = this['thr$in-reply-to'].ref.match(/[0-9]*$/);
					entryID = entryID[0];

					if (CommList[entryID] == void (0)) {		//記事ID
						CommList[entryID] = {};
						CommList[entryID]['href'] = this['thr$in-reply-to'].href;
					}
					if (CommList[entryID][CommID] == void (0)) {
						CommList[entryID][CommID] = {};
						if (this['thr$in-reply-to'].href.indexOf('blogspot.com/p/') != -1) {
							IsPage = true;
						}
						var postFeed = settings.yourURL + "feeds/posts/default/" + entryID;
						if (IsPage) {
							postFeed = settings.yourURL + "feeds/pages/default/" + entryID;
						}

						jQuery.ajax({
							data: settings.ajaxData,
							timeout: settings.timeout,
							url: postFeed,
							dataType: 'jsonp'
						}).done(function (data, textStatus, jqXHR) {
							CommList[entryID]['title'] = data.entry.title.$t;
						}).fail(function (jqXHR, textStatus, errorThrown) {
							var err = "";
							switch (textStatus) {
								case 'parsererror':
									err = 'Requested JSON parse failed.';
									break;
								case 'timeout':
									err = 'Time out error.';
									break;
								case 'abort':
									err = 'Request aborted.';
									break;
								default:
									err = 'Uncaught Error.';
									break;
							}
							CommList[entryID]['title'] = "Unknown title. " + err;
						}).always(function (data, textStatus) {
							jQuery(results.jQThis).find("#" + entryID).html(CommList[entryID]['title']);
							//document.getElementById(entryID).innerHTML = CommList[entryID]['title'];
						});
					}
				}

				if ('thr$in-reply-to' in this) { //記事がある場合				
					CommList[entryID]['reply-to'] = this['thr$in-reply-to'].href;
				} else { //記事が削除された場合
					var entryID = 'NotExist';
					CommList[entryID] = {};
					CommList[entryID][CommID] = {};
					CommList[entryID]['reply-to'] = '';
				}

				CommList[entryID][CommID]['ID'] = CommID;
				CommList[entryID][CommID]['href'] = "";				//コメントリンク
				CommList[entryID][CommID]['parent'] = "";				//親コメントID
				CommList[entryID][CommID]['title'] = this.title.$t;		//コメントタイトル
				CommList[entryID][CommID]['author'] = {};				//投稿者情報
				CommList[entryID][CommID]['author']['name'] = this.author[0].name.$t;
				if (this.author[0].uri != void (0)) {
					CommList[entryID][CommID]['author']['uri'] = this.author[0].uri.$t;
				}
				CommList[entryID][CommID]['author']['image'] = this.author[0].gd$image.src;


				//コメント日時
				D = this.updated.$t.match(/(\d+)-(\d+)-(\d+)T(\d+):(\d+):(\d+)\.(\d{3})([+-])(\d+):(\d+)/);
				CommList[entryID][CommID]['Date'] = new Date(D[1], D[2] - 1, D[3], D[4], D[5], D[6], D[7]);

				for (var i = 0; i < this.link.length; ++i) {
					switch (this.link[i].rel) {
						case "alternate":	//コメントのリンク
							var hf = this.link[i].href;
							CommList[entryID][CommID]['href'] = hf;
							break;
						case "related":		//親コメントがある場合
							var pid = this.link[i].href.match(/[0-9]*$/);
							CommList[entryID][CommID]['parent'] = pid[0];
							if (CommList[entryID][pid[0]] == void (0)) {
								CommList[entryID][pid[0]] = {};
								CommList[entryID][pid[0]]['ID'] = pid[0];
								CommList[entryID][pid[0]]['parent'] = "";
								CommList[entryID][pid[0]]['href'] = "";
								CommList[entryID][pid[0]]['title'] = "&hellip;";
								CommList[entryID][pid[0]]['Date'] = "";
								CommList[entryID][pid[0]]['author'] = {};
								CommList[entryID][pid[0]]['author']['name'] = "&hellip;";
								CommList[entryID][pid[0]]['author']['uri'] = "";
								CommList[entryID][pid[0]]['author']['image'] = "";
							}
							if (CommList[entryID][pid[0]]['children'] == void (0)) {
								CommList[entryID][pid[0]]['children'] = {};
							}
							CommList[entryID][pid[0]]['children'][CommID] = CommID;
							break;
					}
				}
				//if (count >= maxCount -1) return false;		//maxCount個のコメントを取得したら抜ける
			});
			return CommList;
		}

		function TRC_buildThreadedRecentCommments(results) {
			var quoteL = "&ldquo;";
			var quoteR = "&rdquo;";
			var frag = document.createDocumentFragment();

			var ele = document.createElement("div");
			ele.setAttribute("class", "ThreadedRecentComments");
			var Tier1 = frag.appendChild(ele);

			ele = document.createElement("div");
			ele.setAttribute("class", "threadList")
			var Tier2 = Tier1.appendChild(ele);
			ele = document.createElement("div");
			ele.setAttribute("class", "powered")
			ele.innerHTML = powered;
			Tier1.appendChild(ele);

			for (var i in results.CommList) {
				//モバイル用リンクに修正
				if (results.isMobile) {
					results.CommList[i]['reply-to'] += "?m=1";
				}

				//記事titleの取得が非同期なのでidを指定しておき後で書き加える
				ele = document.createElement("div");
				ele.setAttribute("class", "postTitle")
				var Tier3 = Tier2.appendChild(ele);

				ele = document.createElement("div");
				ele.setAttribute("class", "postTitleText");
				var Tier4 = Tier3.appendChild(ele);

				ele = document.createElement("a");
				ele.setAttribute("href", results.CommList[i]['reply-to']);
				var Tier5 = Tier4.appendChild(ele);

				ele = document.createElement("span");
				ele.setAttribute("id", i);
				ele.textContent = "Loading... or Maybe Deleted.";
				var Tier6 = Tier5.appendChild(ele);

				for (var j in results.CommList[i]) {
					if (results.CommList[i][j]['parent'] == "") {	//親コメントだけを処理する
						ele = document.createElement("div");
						ele.setAttribute("class", "commentThread");
						Tier4 = Tier3.appendChild(ele);
						ele = document.createElement("div");
						ele.setAttribute("class", "parent clearfloat");
						Tier5 = Tier4.appendChild(ele);

						ele = commentDOM(results, i, j);
						Tier6 = Tier5.appendChild(ele);

						//コメ主
						var auth = results.CommList[i][j]['author']['name'];


						//子コメント出力
						if (results.CommList[i][j]['children'] !== void (0)) {	//子コメント有無で
							//Node.prototype.prependChild = function(e){ this.insertBefore(e,this.firstChild); }
							var cf = document.createDocumentFragment();
							//親コメントを取得していない場合、最初のコメントをコメ主にする
							if (auth == "&hellip;") {
								var l = Object.keys(results.CommList[i][j]['children']).length;
								var pid = Object.keys(results.CommList[i][j]['children'])[l - 1];
								auth = results.CommList[i][pid]['author']['name'];
							}
							for (var k in results.CommList[i][j]['children']) {
								ele = document.createElement("div");
								//コメ主と同じ名前だとparent　違えばchild
								if (results.CommList[i][k]['author']['name'] == auth) {
									ele.setAttribute("class", "parent clearfloat");
								} else {
									ele.setAttribute("class", "child clearfloat");
								}
								Tier5 = cf.insertBefore(ele, cf.firstChild);
								ele = commentDOM(results, i, k);
								Tier6 = Tier5.appendChild(ele);
							}
							Tier5 = Tier4.appendChild(cf);
						}
					}
				}
			}
			return frag;
		}

		//吹出用DOM
		function commentDOM(results, i, j) {
			var ret = document.createDocumentFragment();
			var ele = document.createElement("span");
			ele.setAttribute("class", "comment");
			var Tier1 = ret.appendChild(ele);

			if (Date.now() - results.CommList[i][j]['Date'] < 86400000 * settings.daysNew) {
				ele = document.createElement("span");
				ele.setAttribute("class", "new");
				ele.textContent = "New!";
				var Tier2 = Tier1.appendChild(ele);
			}

			ele = document.createElement("span");
			ele.setAttribute("class", "commentBaloon");
			var Tier2 = Tier1.appendChild(ele);
			ele = document.createElement("span");
			ele.setAttribute("class", "commentTxt");
			if (results.CommList[i][j]['href'] == "") {
				ele.innerHTML = results.CommList[i][j]['title'];
			} else {
				if (results.isMobile) {		//モバイル用リンクに修正
					results.CommList[i][j]['href'] = results.CommList[i][j]['href'].replace(/showComment=/, "m=1&showComment=");
				}
				var ele2 = document.createElement("a");
				ele2.setAttribute("href", results.CommList[i][j]['href']);
				ele2.innerHTML = results.CommList[i][j]['title'];
				ele.appendChild(ele2);
			}
			var Tier3 = Tier2.appendChild(ele);

			ele = document.createElement("span");
			ele.setAttribute("class", "postedby");
			Tier2 = Tier1.appendChild(ele);
			ele = document.createElement("img");
			//ele.setAttribute("width", "32");
			//ele.setAttribute("height", "32");
			ele.setAttribute("src", results.CommList[i][j]['author']['image']);
			Tier2.appendChild(ele);
			ele = document.createElement("span");
			ele.setAttribute("class", "auth");
			ele.innerHTML = "[" + results.CommList[i][j]['author']['name'] + "] "
			Tier2.appendChild(ele);
			ele = document.createElement("span");
			ele.setAttribute("class", "date");
			ele.textContent = results.CommList[i][j]['Date'].toLocaleString();
			Tier2.appendChild(ele);

			return ret;
		}
	};
})(jQuery);
