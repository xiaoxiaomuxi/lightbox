;
(function($) {

    var LightBox = function(setting) {
        var self = this;

        this.setting={
        	speed:500
        };
        $.extend(this.setting,setting ||{})
        //创建遮罩和弹出框
        this.popupMask = $('<div id="G-lightbox-mask">');
        this.popupWin = $('<div id="G-lightbox-popup">');

        //保存body
        this.bodyNode = $(document.body);

        //渲染其余的DOM，并插入body
        this.renderDOM();

        this.picView = this.popupWin.find("div.lightbox-pic-view");
        this.popupPic = this.popupWin.find("img.lightbox-image");
        this.picCaption = this.popupWin.find("div.lightbox-pic-caption");
        this.Btn= this.popupWin.find("span.lightbox-btn");
        this.nextBtn = this.popupWin.find("span.lightbox-next-btn");
        this.prevBtn = this.popupWin.find("span.lightbox-prev-btn");
        this.captionText = this.popupWin.find("p.lightbox-pic-desc");
        this.currentIndex = this.popupWin.find("p.lightbox-of-index");
        this.closeBtn = this.popupWin.find("span.lightbox-close-btn");


        //准备开发事件委托，获取组数据
        this.groupName = null;
        this.group = [];
        this.bodyNode.delegate(".js-lightbox,*[data-role=lightbox]", "click", function(e) {
            var currentGroupName = $(this).attr("data-group");

            if (currentGroupName != self.groupName) {
                self.groupName = currentGroupName;
                //根据当前组名获取同组数据
                self.getGroup();
            }
            //初始化弹窗
            self.initPopup($(this));
        });

        this.popupMask.click(function() {
            $(this).fadeOut();
            self.popupWin.fadeOut();
            self.clear=false;
        });
        this.closeBtn.click(function() {
            self.popupMask.fadeOut();
            self.popupWin.fadeOut();
            self.clear=false;
        });

        //绑定切换按钮
        this.flag=true;
        this.popupWin.hover(function() {
            if (self.group.length > 1) {
                if (!self.nextBtn.hasClass("disabled")) {
                    self.nextBtn.addClass("lightbox-next-btn-show");
                }
                if (!self.prevBtn.hasClass("disabled")) {
                    self.prevBtn.addClass("lightbox-prev-btn-show");
                }
            }
        }, function() {
            self.nextBtn.removeClass("lightbox-next-btn-show");
            self.prevBtn.removeClass("lightbox-prev-btn-show");
        });
        this.nextBtn.click(function(e) {
            if (self.flag) {
                self.flag = false;
                e.stopPropagation();
                self.goto("next")
            }
        });
        this.prevBtn.click(function(e) {
            if (self.flag) {
                self.flag= false;
                e.stopPropagation();
                self.goto("prev")
            }
        })
        this.isIE6=/MSIE 6.0/gi.test(window.navigator.userAgent);

        var timer=null;
        this.clear=false;
        $(window).resize(function(){
        	if(self.clear){
        	window.clearTimeout(timer);
        	timer=window.setTimeout(function(){
        		self.loadPic(self.group[self.index].src)
        	},500);
        	if(self.isIE6){
        		self.popupMask.css({
        			width:$(window).width(),
        			height:$(window).height()
        		})
        	}
        }
        });
        if(this.isIE6){
        	$(window).scroll(function(){
        		self.popupMask.css("top",$(window).scrollTop());
        		self.popupWin.css("top",self.winTOP+$(window).scrollTop());
        	})
        };
        this.winTOP=null;
    };
    LightBox.prototype = {
        goto: function(dir) {
            if (dir === "next") {
                this.index++;
                if (this.index >= this.group.length - 1) {
                    this.nextBtn.addClass("disabled").removeClass("lightbox-next-btn-show");
                }
                this.prevBtn.removeClass("disabled");
                var src = this.group[this.index].src;
                this.loadPic(src);

            } else if (dir === "prev") {
                this.index--;
                if (this.index == 0) {
                    this.prevBtn.addClass("disabled").removeClass("lightbox-prev-btn-show");
                }
                this.nextBtn.removeClass("disabled");
                var src = this.group[this.index].src;
                this.loadPic(src);
            }
        },
        loadPic: function(sourceSrc) {
            var self = this;
            self.popupPic.css({ width: "auto", height: "auto" }).hide();
            self.picCaption.hide();
            this.preloadPic(sourceSrc, function() {

                self.popupPic.attr("src", sourceSrc);
                var picWidth = self.popupPic.width();
                var picHeight = self.popupPic.height();
                self.changePic(picWidth, picHeight);
            })
        },
        changePic: function(width, height) {
            var self = this;
            var winHeight = $(window).height();
            var winWidth = $(window).width();
            var scale = Math.min(winWidth / (width + 10), winHeight / (height + 10), 1);
            width = width * scale;
            height = height * scale;
            this.picView.animate({
                width: width - 10,
                height: height - 10
            },self.setting.speed);

            self.winTOP=(winHeight - height) / 2;
            self.top=self.winTOP;
            if(this.isIE6){
            	this.top+=$(window).scrollTop();
            }
            this.popupWin.animate({
                width: width,
                height: height,
                marginLeft: -(width / 2),
                top: self.top
            },self.setting.speed, function() {
                self.popupPic.css({
                    width: width - 10,
                    height: height - 10
                }).fadeIn();
                self.picCaption.fadeIn();
            });

            this.captionText.text(this.group[this.index].caption);
            this.currentIndex.text("当前索引：" + (this.index + 1) + "of " + this.group.length);
            this.flag=true;
            self.clear=true;
            
        },
        preloadPic: function(src, callback) {
            var img = new Image();
            if (!!window.ActiveXObject) {
                img.onreadystatechange = function() {
                    if (this.readyState == "complete") {
                        callback();
                    };
                };
            } else {
                img.onload = function() {
                    callback();
                };
            };
            img.src = src;
        },
        showMaskPopup: function(sourceSrc, curId) {
            var self = this;
            this.popupPic.hide();
            this.picCaption.hide();


            var winWidth = $(window).width(),
                winHeight = $(window).height();

            this.picView.css({
                width: winWidth / 2,
                height: winHeight / 2,
            });
            var viewHeight = winHeight / 2 + 10;
            if(this.isIE6){
            	var scrollTop=$(window).scrollTop();
            	this.popupMask.css({
            		width:winWidth,
            		height:winHeight,
            		top:scrollTop
            	})
            }
            this.popupMask.fadeIn();
            this.popupWin.fadeIn();
           var winTOP=(winHeight - viewHeight) / 2;
            this.popupWin.css({
                width: winWidth / 2 + 10,
                height: winHeight / 2 + 10,
                marginLeft: -(winWidth / 2 + 10) / 2,
                top: (this.isIE6?-(scrollTop+viewHeight):-viewHeight)
            }).animate({
                top: (this.isIE6?(scrollTop+winTOP):winTOP)
            },self.setting.speed, function() {
                // 加载图片
                self.loadPic(sourceSrc);
            });

            //根据当前点击元素ID获取当前索引
            this.index = this.getIndexOf(curId);


            var groupLength = this.group.length;
            if (groupLength > 1) {
                if (this.index === 0) {
                    this.prevBtn.addClass("disabled");
                    this.nextBtn.removeClass("disabled");
                } else if (this.index == groupLength - 1) {
                    this.nextBtn.addClass("disabled");
                    this.prevBtn.removeClass("disabled");
                } else {
                    this.prevBtn.removeClass("disabled");
                    this.nextBtn.removeClass("disabled");
                }
            }

        },
        getIndexOf: function(curId) {
            var index = 0;

            $(this.group).each(function(i) {
                index = i;
                if (this.id === curId) {
                    return false;
                };
            });
            return index;
        },
        initPopup: function(curObj) {
            var self = this,
                sourceSrc = curObj.attr("data-source"),
                curId = curObj.attr("data-id");

            this.showMaskPopup(sourceSrc, curId);


        },
        getGroup: function() {
            var self = this;
            //根据当前组名获取页面中所有同组的对象
            var grouplist = this.bodyNode.find("*[data-group=" + this.groupName + "]");

            self.group.length = 0;
            grouplist.each(function() {
                self.group.push({
                    src: $(this).attr("data-source"),
                    id: $(this).attr("data-id"),
                    caption: $(this).attr("data-caption")
                });
            })
        },
        renderDOM: function() {
            var strDOM = '<div class="lightbox-pic-view">' +
                '<span class="lightbox-btn lightbox-prev-btn"></span>' +
                '<img class="lightbox-image">' +
                '<span class="lightbox-btn lightbox-next-btn"></span>' +
                '</div>' +
                '<div class="lightbox-pic-caption">' +
                '<div class="lightbox-caption-area">' +
                '<p class="lightbox-pic-desc text-ellipsis"></p>' +
                '<p class="lightbox-of-index text-ellipsis"></p>' +
                '</div>' +
                '<span class="lightbox-close-btn"></span>' +
                '</div>';

            //插入到this.popupWin
            this.popupWin.html(strDOM);
            //把遮罩和弹出框插入到body
            this.bodyNode.append(this.popupMask);
            this.bodyNode.append(this.popupWin);
        }

    };
    window["LightBox"] = LightBox;
})(jQuery);
