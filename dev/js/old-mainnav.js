var emptyFunction = function(){}; //empty function that's called later as a placeholder to prevent console errors.
    
    function mainNavInit() {
        var mainNav = {
            element     : $(".opers-main-nav"),
            menu        : $(".opers-main-nav__menu"),
            drawer      : $(".opers-main-nav__drawer"),
            navItems    : $(".opers-main-nav__menu li a"), //change this so that the anchor tags get styled, it'll make it easier I think
            
            isOpen      : false,
            isAnimating : false,
            
            
            close : function(){
                this.drawer.slideUp(325, function(){
                    mainNav.navItems.removeClass('active');
                     mainNav.isOpen = false;
                });
                  
            },

            open : function() {
                this.drawer.slideDown(325, function(){
                    mainNav.isOpen = true;
                });
                 
            },
            
            showMenu : function(navItemId) {
                var navItem = $("#"+navItemId);
                
                navItem.addClass("active").parent("li").siblings("li").find("a").removeClass("active");//add 'active' class to the anchor currently hovered over, remove it from all others
                var $targetMenu = $("#"+navItem.data("nav-target"));
                
                $($targetMenu).show().siblings().hide();//shows desired navigation menu, and hides all others
            }
        };
            
        
        //event handlers 
        $(document).on("mouseup touchstart", function (e) {
            if (mainNav.isOpen   &&   !mainNav.element.is(e.target)  &&   mainNav.element.has(e.target).length === 0) {
                mainNav.close();
            } 
        }); // if the mainNav is open, and the target of a touch/click isn't the navwrap nor a descendant of the drawer, close the nav. (for touch screens)


        mainNav.navItems.on('touchend', function(e) {
            if (!$(this).hasClass('active')) {
                //check if clicked anchor tag has active class.  If not, prevent the link from redirecting, but do show the nav
                e.preventDefault();
                mainNav.open();
                mainNav.showMenu($(this).attr("id"));
            }
        }); //if you touch a link that doesnt have the 'active' parent, 
        
        mainNav.navItems.on('keydown', function(e){
            var currentNavItem = $(this).parent("li");
            var nextNavItem = currentNavItem.next().find('a');
            var prevNavItem = currentNavItem.prev().find('a');
            var targetNav = $("#"+$(this).attr("data-nav-target")); 
            var currentNavItemHasFocus = $(this).hasClass("active");

            //handle opening and closing
            if (e.which === 40 && (!mainNav.isOpen  ||  !currentNavItemHasFocus)) {
                //down-arrow pressed, drawer isnt open
                e.preventDefault(); //prevent page from scrolling
                mainNav.open(); //open drawer
                mainNav.showMenu($(this).attr("id")); //show menu
            } else if (e.which === 40 && mainNav.isOpen) {
                //down-arrow, drawer is open
                e.preventDefault();
                targetNav.find('a')[0].focus();//hop to first anchor tag in associated menu

            } else if (e.which===38) {
                //up-arrow
                e.preventDefault();//prevent page from scrolling
                mainNav.close();
            } 


            //right/left arrow keys
            if (e.which === 39) {
                //right-arrow
                targetNav = nextNavItem;
                targetNav.focus();
                if (mainNav.isOpen) {
                    mainNav.showMenu(targetNav.attr("id"));
                }
            } else if (e.which === 37) {
                //left-arrow
                targetNav = prevNavItem;
                targetNav.focus();
                if (mainNav.isOpen) {
                    mainNav.showMenu(targetNav.attr("id"));
                }
            }
        });
        
        
        $(".opers-main-nav__drawer a").on('keydown', function(e){
            if (e.which === 38) {
                e.preventDefault();
                $(".opers-main-nav__menu a.active")[0].focus();
                mainNav.close();
            }
        });
        
        //show drawer when you hover over the navlinks menu
        mainNav.menu.hoverIntent({
            over: mainNav.open.bind(mainNav),
            out: emptyFunction,
            interval: 50
        }); 

        //deactivate entire slider when the mouse leaves the nav wrap (which includes the menu drawer)
        mainNav.element.hoverIntent({
            over: emptyFunction,
            out: mainNav.close.bind(mainNav),
            timeout: 200
        }); 

        
        //show the relevant nav depending on which menu item you're hovering over.  The other hoverintents handle opening the drawer
        mainNav.navItems.hoverIntent({
            over: function(){
                mainNav.showMenu($(this).attr("id"));
            },
            out: emptyFunction,
            interval: 50 //same interval as the open hoverintent
            
        
        }); 
    }
    
    
    mainNavInit();