(function() {
    // 辅助函数：添加 ignore 类，防止翻译菜单项
    function addIgnoreClass() {
        // 1. 找到所有语言切换的菜单项 (href 包含 javascript:translate)
        var languageItems = document.querySelectorAll('a[href*="javascript:translate"]');
        languageItems.forEach(function(item) {
            item.classList.add('ignore');
            // 同时也给内部的 span 添加 ignore，双重保险
            var spans = item.querySelectorAll('span');
            spans.forEach(function(span) {
                span.classList.add('ignore');
            });
        });

        // 2. 找到“语言/Language”这个父菜单项
        // 遍历所有菜单项查找包含特定文本的元素
        var allMenuItems = document.querySelectorAll('.menus_item > a.site-page, .menus_item_child > li > a');
        allMenuItems.forEach(function(item) {
            if (item.textContent.includes('语言') || item.textContent.includes('Language')) {
                item.classList.add('ignore');
                var spans = item.querySelectorAll('span');
                spans.forEach(function(span) {
                    span.classList.add('ignore');
                });
            }
        });
    }

    // 辅助函数：配置自定义术语
    function configureNomenclature() {
        // 配置术语库：原文 -> 英文
        // 格式：原文=译文，每行一个
        // 注意：必须在 translate.execute() 之前调用

        translate.nomenclature.append('chinese_simplified', 'english', `
            关于=About
            友链=Blogroll
            文章=Posts
            分类=Categories
            标签=Tags
            归档=Archives
            清单=List
            留言板=Guestbook
            搜索=Search
            友链监测=Link Uptime Monitor
            洛屿的小站=Luoy's Site
            博客主=Blogger
            评论区=Comments
            置顶帖=Sticky Post
            页脚=Footer
            侧边栏=Sidebar
            站点地图=Sitemap
            主题=Theme
            插件=Plugin
            头像=Avatar
            页面浏览量=Page Views
            独立访客=Unique Visitors
            引用通告=Trackback
            垃圾评论=Spam
            永久链接=Permalink
            聚合内容=RSS Feed
        `);

        // 日语翻译
        translate.nomenclature.append('chinese_simplified', 'japanese', `
            关于=について
            友链=リンク集
            文章=記事
            分类=カテゴリー
            标签=タグ
            归档=アーカイブ
            清单=リスト
            留言板=ゲストブック
            搜索=検索
            友链监测=リンク監視
            洛屿的小站=洛屿の小サイト
            博客主=ブロガー
            评论区=コメント欄
            置顶帖=固定記事
            页脚=フッター
            侧边栏=サイドバー
            站点地图=サイトマップ
            主题=テーマ
            插件=プラグイン
            头像=アバター
            页面浏览量=ページビュー
            独立访客=ユニークユーザー
            引用通告=トラックバック
            垃圾评论=スパム
            永久链接=パーマリンク
            聚合内容=RSSフィード
        `);

        // 韩语翻译
        translate.nomenclature.append('chinese_simplified', 'korean', `
            关于=소개
            友链=블로그롤
            文章=게시물
            分类=카테고리
            标签=태그
            归档=아카이브
            清单=목록
            留言板=방명록
            搜索=검색
            友链监测=링크 모니터링
            洛屿的小站=뤄위의 작은 사이트
            博客主=블로거
            评论区=댓글란
            置顶帖=상단 고정 게시물
            页脚=푸터
            侧边栏=사이드바
            站点地图=사이트맵
            主题=테마
            插件=플러그인
            头像=아바타
            页面浏览量=페이지뷰
            独立访客=고유 방문자
            引用通告=트랙백
            垃圾评论=스팸
            永久链接=퍼머링크
            聚合内容=RSS 피드
        `);

        // 法语翻译
        translate.nomenclature.append('chinese_simplified', 'french', `
            关于=À propos
            友链=Blogroll
            文章=Articles
            分类=Catégories
            标签=Étiquettes
            归档=Archives
            清单=Liste
            留言板=Livre d'or
            搜索=Recherche
            友链监测=Surveillance des liens
            洛屿的小站=Site de Luoy
            博客主=Blogueur
            评论区=Commentaires
            置顶帖=Article épinglé
            页脚=Pied de page
            侧边栏=Barre latérale
            站点地图=Plan du site
            主题=Thème
            插件=Extension
            头像=Avatar
            页面浏览量=Pages vues
            独立访客=Visiteurs uniques
            引用通告=Rétrolien
            垃圾评论=Spam
            永久链接=Lien permanent
            聚合内容=Flux RSS
        `);

        // 德语翻译
        translate.nomenclature.append('chinese_simplified', 'german', `
            关于=Über
            友链=Blogroll
            文章=Beiträge
            分类=Kategorien
            标签=Tags
            归档=Archive
            清单=Liste
            留言板=Gästebuch
            搜索=Suche
            友链监测=Link-Überwachung
            洛屿的小站=Luoys Seite
            博客主=Blogger
            评论区=Kommentare
            置顶帖=Angepinnte Beitrag
            页脚=Fußzeile
            侧边栏=Seitenleiste
            站点地图=Seitenverzeichnis
            主题=Theme
            插件=Plugin
            头像=Avatar
            页面浏览量=Seitenaufrufe
            独立访客=Eindeutige Besucher
            引用通告=Trackback
            垃圾评论=Spam
            永久链接=Permanenter Link
            聚合内容=RSS-Feed
        `);

        // 繁体中文翻译（适用于港澳台地区）
        translate.nomenclature.append('chinese_simplified', 'chinese_traditional', `
            关于=關於
            友链=友鏈
            文章=文章
            分类=分類
            标签=標籤
            归档=歸檔
            清单=清單
            留言板=留言板
            搜索=搜尋
            友链监测=友鏈監測
            洛屿的小站=洛嶼的小站
            博客主=部落客
            评论区=留言區
            置顶帖=置頂文章
            页脚=頁尾
            侧边栏=側邊欄
            站点地图=網站地圖
            主题=主題
            插件=外掛
            头像=頭像
            页面浏览量=瀏覽量
            独立访客=獨立訪客
            引用通告=引用通告
            垃圾评论=垃圾留言
            永久链接=永久連結
            聚合内容=RSS訂閱
        `);
        
        // 如果有其他语言的术语，也可以继续追加
        // translate.nomenclature.append('chinese_simplified', 'japanese', `...`);
    }

    // 等待 translate.js 加载
    var checkTranslate = setInterval(function() {
        if (typeof translate !== 'undefined') {
            clearInterval(checkTranslate);
            
            // 在执行翻译前，先添加 ignore 类
            addIgnoreClass();

            // 设置本地语言为简体中文
            translate.language.setLocal('chinese_simplified');
            // 使用 Edge 翻译服务（客户端）
            translate.service.use('client.edge');
            
            // 配置自定义术语
            configureNomenclature();
            
            // 确保 ignore 类被忽略（虽然通常默认就是 ignore，但显式设置更安全）
            if (translate.ignore && translate.ignore.class) {
                translate.ignore.class.push('ignore');
            }
            
            // 初始化
            translate.execute();
            
            console.log('Translate.js initialized');
            
            // 针对 PJAX 的处理：页面切换后重新触发翻译
            document.addEventListener('pjax:complete', function() {
                addIgnoreClass(); // PJAX 跳转后重新添加 ignore
                translate.execute();
            });
        }
    }, 200);
})();
