
$(document).ready(function(){

	$('body').on('click', function(obj) {
		if($(obj.target).hasClass('line1') || $(obj.target).hasClass('hamburger1') || $(obj.target).hasClass('image-obj3')){
			$('.hamburger1').toggleClass("is-active");
			$('.hamburger1').toggleClass('t-h-active');
			$('body').toggleClass('show-box-menu');
		}else{
			if(typeof $(obj.target).parents('#catalog-menu-box').val() === "undefined"){
				$('.hamburger1').removeClass("is-active");
				$('.hamburger1').removeClass('t-h-active');
				$('body').removeClass('show-box-menu');
			}
		}
	});
	
	$('body').on('click','.filter', function(obj) {
		$('.filter-box').toggleClass("is-active");
		$('.filter-parent-box').toggleClass("is-active");
	});
	
	$('body').on('click','#sidebar_dismiss', function(obj) {
		$('.filter-box').toggleClass("is-active");
		$('.filter-parent-box').toggleClass("is-active");
	});
	
	
	setFootHeight();
	
});

$(window).resize(function(){

	setFootHeight();

}); 

$(window).load(function(){
	
	setFootHeight();
	

});

function setFootHeight() {
	var f = $('#footer').height();
    $('#foot').css({
        height: f + 'px' 
    });
} 