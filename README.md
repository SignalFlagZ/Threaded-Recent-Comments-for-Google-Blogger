# Threaded-Recent-Comments-for-Google-Blogger
The javascript that displays recent comments interactively with balloons.  
This script is supposed to be used in the HTML / Javascript gadget of blogspot.

##Try TRC
Clone this repository.  
Edit `Test_ThreadedRecentComments.html` file.  
Change `yourURL` option to Your Blog address.  
Open `Test_ThreadedRecentComments.html` file in your browser.  

## Install on your blogspot
[Sample (in Japnese)](https://signal-flag-z.blogspot.com/2017/08/threaded-recent-comments-ver230.html)

Host the following files somewhere.
- ThreadedRecentComments_mini.js
- TRC_Simplest_mini.css
- TRC_Baloon_mini.css

Add jquery to your blog. Edit template html. And add follow lines above </head>tag.
```
<!-- jQuery -->
<script src='https://ajax.googleapis.com/ajax/libs/jquery-3.3.1.min.js' type='text/javascript'/>
```
Add the HTML / Javascript gadget to your blog.
And add the following code.
```
    <div id="TRC" class="TRC_feed">Comments will be here...</div>
    
    <!-- Simplest style  -->
    <link rel="stylesheet" href="https://HOST-URL/TRC_Simplest.css" type="text/css" />
    
    <!-- Baloon style 
    <link rel="stylesheet" href= "https://HOST-URL/TRC_Baloon.css" type="text/css" />
     -->
     <script type="text/javascript" charset="UTF-8">
    //<![CDATA[
    //<![CDATA[
    //<!--
    //============================================================
    //     https://signal-flag-z.blogspot.com/
    //      Copyright 2014-2017 Signal Flag "Z"
    //============================================================
    
    jQuery(document).ready(function () {
     jQuery('#TRC').ThreadedRecentComments({
      yourURL: "https://YOUR-BLOG.blogspot.com/",
      itemCount: 8,
      daysNew: 7,
      isMobile: /[?&](m=1)[&]?/g.test(location.href) ,
      // cssTRC: { "background-color": "blue" }
     });
    });
    //-->
    //]]>
    </script>
```

Change the css and script URL to your host location.  
Change `yourURL` option to Your Blog address.  
You can choose one from two CSS files, TRC_Simplest_mini.css or TRC_Baloon_mini.css.  
##Options
- itemCount
- daysNew
- isMobile

- cssTRC
- cssPostTitle
- cssCommentThread
- cssParentPostedby
- cssChildPostedby
- cssParentCommentBaloon
- cssChildCommentBaloon

