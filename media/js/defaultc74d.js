var min_order_sum;


function goback(el) {
	// if (history.length > 1) { history.back(); return false; }
	history.back();

	setTimeout(function() {
		location.href = $(el).attr('href');
	}, 1000);

	return false;
}

function number_format(number, decimals, dec_point, thousands_sep) {
	number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
	var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : decimals,
    sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
    dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
    s = '',
    toFixedFix = function (n, prec) {
		if (prec>0) {
			return n.toFixed(prec);
		} else {
			var k = Math.pow(10, prec);
			var r = ''+Math.round(Math.round(n * k) / k);
			return ''+r;
		}
    };
	s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
	if (s[0].length > 3) {
		s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
	}
	if ((s[1] || '').length < prec) {
		s[1] = s[1] || '';
		s[1] += new Array(prec - s[1].length + 1).join('0');
	}
	return s.join(dec);
}

function moneyFormat(str) {
	return number_format(str, 0, ',', ' ');
}

function sf(container, sect_id, template, type_id) {
	if (!sf.all) sf.all=[];
	this.sect_id = sect_id;
	this.container = container;
	this.template = template;
	this.type_id = type_id;
	this.init();
	sf.all.push(this);
}
Number.prototype._toFixed = function(pow) {
	// 5 и -1
	if (pow>0) {
		var k = Math.pow(10,pow);
		return Math.round(this/k)*k;
	} else
		return this.toFixed(-pow);
}
sf.prototype = {
	sect_id: '',
	container: null,
	template: null,
	type_id: '',
	init: function() {
		// Авто-сабмит при любом изменении элементов фильтра
		//$('#simple_filter_form input[type="text"]').on('change', sf.update);
		$(this.container+' input[type="checkbox"]').on('click', this.update.bind(this));
		$(this.container+' input[type="radio"]').on('click', this.update.bind(this));
		$(this.container+' select').on('change', this.update.bind(this));
		// Слайдеры
		$(this.container+' .slider-range').each(function(i,obj) {
			params = [];
			params['prop_id'] = $(obj).attr('data-propid');
			params['gt'] = $(obj).attr('data-gt');
			params['lt'] = $(obj).attr('data-lt');
			params['min'] = $(obj).attr('data-min');
			params['max'] = $(obj).attr('data-max');
			params['helper_min'] = $(obj).attr('data-helper-min');
			params['helper_max'] = $(obj).attr('data-helper-max');
			params['precision'] = $(obj).attr('data-precision') || 0;
			
			if (params['gt']==='') params['gt'] = params['min'];
			if (params['lt']==='') params['lt'] = params['max'];
			
			for (key in params) if (key != 'prop_id') params[key]*=1;
			
			// Интервал существующих значений (helper)
			slider_width = $(obj).width();
			helper_width = (params['helper_max']-params['helper_min'])/(params['max']-params['min'])*100;
			if (params['helper_min'] && !helper_width) helper_width = 1;
			
			var helper_start = (params['helper_min']-params['min'])/(params['max']-params['min'])*100;
			
			slider_helper = $('<div>').addClass('slider-helper').insertAfter(obj);
			slider_helper.css({
				width: helper_width+'%',
				left: helper_start+'%'
			});
			
			// Числовые метки над слайдером
			//$(this.container+' #slider_'+params['prop_id']+'_label_min').html(params['min']._toFixed(params['precision']));
			//$(this.container+' #slider_'+params['prop_id']+'_label_max').html(params['max']._toFixed(params['precision']));
			$(this.container+' #slider_'+params['prop_id']+'_label_min').html(number_format(params['min'],-params['precision'],',',' '));
			$(this.container+' #slider_'+params['prop_id']+'_label_max').html(number_format(params['max'],-params['precision'],',',' '));
			avg = params['min']+(params['max']-params['min'])/2;
			//$(this.container+' #slider_'+params['prop_id']+'_label_avg').html(avg._toFixed(params['precision']));
			$(this.container+' #slider_'+params['prop_id']+'_label_avg').html(number_format(avg,-params['precision'],',',' '));
			
			
			//console.log(params);
			
			// Инициализация jquery-ui слайдера
			$(obj).slider({
				range: true,
				min: params['min'],
				max: params['max'],
				values: [params['gt'], params['lt']],
				step: Math.pow(10, params['precision']),
				slide: function(prop_id, event,ui) {
					$(this.container+' #slider_'+prop_id+'_gt').val(ui.values[0]);
					$(this.container+' #slider_'+prop_id+'_lt').val(ui.values[1]);
				}.bind(this, params['prop_id']),
				change: function() {
					this.update();
				}.bind(this),
			});
			// Обратная связь инпутов со слайдером
			$(this.container+' #slider_'+params['prop_id']+'_gt').on('change',function() {
				val = $(this).val();
				if (!val.match(/^[\.0-9]*$/))
					$(this).addClass('incorrect_value');
				else {
					$(this).removeClass('incorrect_value');
					$(obj).slider('values', 0, $(this).val());
				}
			});
			$(this.container+' #slider_'+params['prop_id']+'_lt').on('change',function() {
				val = $(this).val();
				if (!val.match(/^[\.0-9]*$/))
					$(this).addClass('incorrect_value');
				else {
					$(this).removeClass('incorrect_value');
					$(obj).slider('values', 1, $(this).val());
				}
			});
		}.bind(this));
	},
	update: function(obj) {
		data = $(this.container+' form').serializeArray(); 
		data.push({ name: 'comp', value: 'filter' });
		data.push({ name: 'sect_id', value: this.sect_id });
		data.push({ name: 'template', value: this.template });
		data.push({ name: 'type_id', value: this.type_id });
		$(this.container).addClass('loading');
		$(this.container).load('/', data, function() {
			$(this.container).removeClass('loading');
		}.bind(this));
		
	},
	reset: function() {
		data = [];
		data.push({ name: 'comp', value: 'filter' });
		data.push({ name: 'sect_id', value: this.sect_id });
		data.push({ name: 'template', value: this.template });
		data.push({ name: 'type_id', value: this.type_id });
		$(this.container).addClass('loading');
		$(this.container).load('/', data, function() {
			$(this.container).removeClass('loading');
		}.bind(this));
	}
}

var inner = {
	conf: null,
	defaults: null,
	init: function(conf) {
		inner.conf = conf;
	},
	defaults: function(defaults) {
		inner.defaults = defaults;
	},
	load: function(callback) {
		var r = {};
		if (inner.conf.page>1) r.page = inner.conf.page;
		if (inner.conf.items_per_page != inner.defaults.items_per_page) r.items_per_page = inner.conf.items_per_page;
		if (inner.conf.sort != inner.defaults.sort) r.sort = inner.conf.sort;
		//console.log(r);
		if (inner.conf.filter != inner.defaults.filter) r.filter = inner.conf.filter;
		var params = $.param(r);
		//console.log(params);
		//history.pushState(null,null,'?'+params);
		$(inner.conf.container).addClass('loading');
		$(inner.conf.container).load('/', {
			comp: 'catblock',
			sect_id: inner.conf.sect_id,
			mode: inner.conf.mode,
			recursive: 'true',
			page: inner.conf.page,
			items_per_page: inner.conf.items_per_page,
			sort: inner.conf.sort,
			filter: inner.conf.filter,
			template: inner.conf.template,
			type_id: inner.conf.type_id
		}, function() {
			if (inner.conf.template == 'catalog_items') catalogOnReady();
			$(inner.conf.container).removeClass('loading');
			$(window).trigger('resize');
			if (typeof callback === 'function')
				callback();
		});
	},
	setSectId: function(sect_id, callback) {
		inner.conf.sect_id = sect_id;
		inner.load(callback);
	},
	setTemplate: function(template, callback) {
		inner.conf.template = template;
		inner.load(callback);
	},
	setFilter: function(filter, callback) {
		inner.conf.filter = filter;
		inner.conf.page = 1;
		inner.load(callback);
	},
	loadPageTo: function(page,container) {
		old_cont = inner.conf.container;
		inner.conf.container = container;
		inner.conf.page = page;
		inner.load(function() {
			inner.conf.container = old_cont;
		});
	},
	setPage: function(page, callback) {
		inner.conf.page = page;
		inner.load(callback);
		return false;
	},
	setSort: function(sort, callback) {
		inner.conf.sort = sort;
		inner.load(callback);
	},
	setItemsPerPage: function(itemsPerPage, callback) {
		inner.conf.page=1;
		inner.conf.items_per_page = itemsPerPage;
		inner.load(callback);
	}
}

function citiesAC(selector, selectCallback, closeCallback) {
	var citiesCache = {};
	$(selector).autocomplete({
		minLength: 2,
		source: function(request, response) {
			var term = request.term;
			if (term in citiesCache) {
				response(citiesCache[term]);
				return;
			}

			$.getJSON('/?comp=suggest_cities', request, function(data, status, xhr) {
				citiesCache[term] = data;
				response(data);
			});
		},
		select: function(event, ui) {   
			if (typeof selectCallback == 'function') {
				selectCallback(event, ui);
			}
		},
		close: function(event, ui) {
			if (typeof closeCallback == 'function') {
				closeCallback(event, ui);
			}
		}
	});
}

$(document).ready(function() {  

	$('a[data-toggle="tab"][role="tab"]').click(function(){
		window.location.hash = $(this).attr('href');
	});
	
	if(window.location.hash) {
		$('a[data-toggle="tab"][role="tab"][href="'+window.location.hash+'"]').click();
	}
	
	var tooltip_max_timeout;

	$('body').delegate('a[data-modal-form]', 'click', function(obj) {
		$('#modal').modal('show');
		var form_name = $(this).data('modal-form');
		var template = $(this).data('modal-template');
		var data = { comp: 'cform', form_name: form_name, template: template};
		var ext_data = {};
		$(this.attributes).each(function() {
			if (this.name.match(/^data-ext-/))
				ext_data[this.name.replace(/^data-ext-/,'')] = this.value;
		});

		if (ext_data) data.data = ext_data;
		console.log(data);
		$('#modal').load('/', data);
		return false;
	});

	$('body').delegate('[data-cart-order]', 'click', function() {
		if ($(this).hasClass('disabled')) {
			alert('Минимальная сумма заказа - '+min_order_sum+' рублей');
			return false;
		}
	});

	$('body').delegate('[data-cart-assembly]', 'change', function(e) {
		var id = $(this).data('cart-assembly'),
			item_id = $(this).data('itemid'),
			$assembly = $('#assembly_'+id);

		if ($(this).is(':checked')) {
			// console.log(id);
			var item_qty = $('[data-cart-quantity="'+id+'"]').val();

			$.post('/', {
				comp: 'list_server',
				list: 'cart',
				action: 'add',
				item_id: 'ec8hs7gd', // сборка
				subitem_id: item_id,
				quantity: item_qty,
				onlycartid: true
			}, function(cart_id) {
				$assembly.find('[data-cart-quantity]').attr('data-cart-quantity', cart_id).data('cart-quantity', cart_id).prop('data-cart-quantity', cart_id);
				$assembly.find('[data-cart-total]').attr('data-cart-total', cart_id).data('cart-total', cart_id).prop('data-cart-total', cart_id);
				$assembly.find('[data-cart-quantity]').val(item_qty).trigger('change');

				$assembly.find('.assembly-price').removeClass('d-none').addClass('d-inline-block');
			});

		} else {

			$.post('/', {
				comp: 'list_server',
				list: 'cart',
				action: 'del',
				item_id: 'ec8hs7gd', // сборка
				subitem_id: item_id,
				quantity: item_qty,
				onlycartid: true
			}, function(cart_id) {
				$assembly.find('[data-cart-quantity]').val(0).trigger('change');
				$assembly.find('.assembly-price').addClass('d-none').removeClass('d-inline-block');
			})
		}
	});

	$('body').delegate('[data-cart-quantity]', 'change keyup', function(e) {
		var id = $(this).data('cart-quantity'),
			$assembly = $('#assembly_'+id);

		if ($(this).val() == '' || $(this).val() == '0') {
			if (e.type == 'change') {
				$(this).val('1');
			} else {
				return false;
			}
		}

		var max = $(this).prop('max');

		if (parseInt($(this).val()) > parseInt(max))
		{
			$(this).tooltip({
				trigger: 'manual',
				title: 'Вы можете заказать не более '+max+' шт',
			}).tooltip('show');

			$(this).on('focus change blur', function() {
				clearTimeout(tooltip_max_timeout);
				$(this).tooltip('hide');
			});

			tooltip_max_timeout = setTimeout(function() {
				$(this).tooltip('hide');
			}, 3000);

			$(this).val(max);
		}

		var value = $(this).val();

		if ($assembly.length) {
			$assembly.find('[data-cart-quantity]').prop('max', value);

			if ($assembly.find('[data-cart-quantity]').val() > 0) {
				$assembly.find('[data-cart-quantity]').val(value).trigger('change');
			}
		}


		recalcCart();
	});

	$('body').delegate('[data-cart-remove]', 'click', function() {
		var id = $(this).data('cart-remove'),
			buybutton = $(this).data('buy-button'),
			$assembly = $('#assembly_'+id);

		$('[data-cart-quantity="'+id+'"]').val(0);
		$('[data-cart-line="'+id+'"]').hide();
		$('[data-cart-line-related="'+id+'"]').hide();
		$('.'+buybutton).removeClass('exists_in_list');

		if ($assembly.length) $assembly.find('[data-cart-quantity]').val(0);

		
		$.getJSON('/', {
			comp: 'cart',
			action: 'xhr_removeItem',
			data: { rec_id: id }
		}, function(data) {
			loadStep('delivery');
		});
		return false;
	});


	$('body').delegate('[data-cart-delete]', 'click', function() {
		var id = $(this).data('cart-delete'),
			buybutton = $(this).data('buy-button'),
			$assembly = $('#assembly_'+id);

		$('[data-cart-quantity="'+id+'"]').val(0);
		$('[data-cart-line="'+id+'"]').hide();
		$('[data-cart-line-related="'+id+'"]').hide();
		$('.'+buybutton).removeClass('exists_in_list');

		if ($assembly.length) $assembly.find('[data-cart-quantity]').val(0);

		recalcCart();
		return false;
	});

	$('body').delegate('[data-cart-increase]', 'click', function() {
		var id = $(this).data('cart-increase');
		var $assembly = $('#assembly_'+id);
		var inp = $('[data-cart-quantity="'+id+'"]');
		var max = parseInt($(inp).prop('max'));
		var is_tkani = $('[data-cart-tkani="'+id+'"]').length;
		var delta = is_tkani ? 0.1 : 1;
		var value = parseFloat(inp.val());
		if (value < 999) value += delta;
		
		if (is_tkani) {
			value = number_format(value, 1, '.', '');
		} else {
			value = Math.round(value);
		}

		clearTimeout(tooltip_max_timeout);
		inp.tooltip('hide');

		if (value > max)
		{
			inp.tooltip({
				trigger: 'manual',
				title: 'Вы можете заказать не более '+max+' шт',
			}).tooltip('show');

			inp.on('focus change blur', function() {
				clearTimeout(tooltip_max_timeout);
				inp.tooltip('hide');
			});

			tooltip_max_timeout = setTimeout(function() {
				inp.tooltip('hide');
			}, 3000);

			value = max;
		}
		
		inp.val(value);

		if ($assembly.length) {
			$assembly.find('[data-cart-quantity]').prop('max', value);
			if ($assembly.find('[data-cart-quantity]').val() > 0) {
				$assembly.find('[data-cart-quantity]').val(
					parseInt($assembly.find('[data-cart-quantity]').val())+1
				).trigger('change');
			}
		}

		recalcCart();
	});

	$('body').delegate('[data-cart-decrease]', 'click', function() {
		var id = $(this).data('cart-decrease');
		var $assembly = $('#assembly_'+id);
		var buybutton = $(this).data('buy-button');
		var inp = $('[data-cart-quantity="'+id+'"]');
		var max = parseInt($(inp).prop('max'));
		var is_tkani = $('[data-cart-tkani="'+id+'"]').length;
		var delta = is_tkani ? 0.1 : 1;
		var value = parseFloat(inp.val());
		if (value > 0) value -= delta;

		clearTimeout(tooltip_max_timeout);
		inp.tooltip('hide');

		if (value == 0) {
			return false;
			// $('[data-cart-line="'+id+'"]').hide();
			// $('.'+buybutton).removeClass('exists_in_list');
		}
		
		if (is_tkani) {
			value = number_format(value,1,'.','');
		} else {
			value = Math.round(value);
		}

		if (value > max)
		{
			inp.tooltip({
				trigger: 'manual',
				title: 'Вы можете заказать не более '+max+' шт',
			}).tooltip('show');

			inp.on('focus change blur', function() {
				clearTimeout(tooltip_max_timeout);
				inp.tooltip('hide');
			});

			tooltip_max_timeout = setTimeout(function() {
				inp.tooltip('hide');
			}, 3000);

			value = max;
		}

		inp.val(value);

		if ($assembly.length) {
			$assembly.find('[data-cart-quantity]').prop('max', value);
			if ($assembly.find('[data-cart-quantity]').val() > value) {
				$assembly.find('[data-cart-quantity]').val(value).trigger('change');
			}
		}

		recalcCart();
	});
		
	$('[data-toggle="tooltip"]').each(function(){
		$(this)
			.css({cursor: 'pointer'})
			.tooltip({placement: $(this).data('placement'), html: ($(this).data('html') || true), content: $(this).data('content')});
	});
	
	$('[data-toggle="popover"]').each(function(){
		$(this)
			.css({cursor: 'pointer'})
			.popover({placement: $(this).data('placement'), trigger: ($(this).data('trigger') ? $(this).data('trigger') : 'hover'), delay: {show: 0, hide: 500}, html: ($(this).data('html') || true), content: $(this).data('content')});
	});
	
	var searchCache = {};
	$('input.suggest_search2').autocomplete({
		minLength: 3,
		source: function(request, response) {
			var term = request.term;
			if (term in searchCache) {
				response(searchCache[term]);
				return;
			}

			$.getJSON('/?comp=suggest_search', request, function(data, status, xhr) {
				searchCache[term] = data;
				response(data);
			});
		},
		select: function(event, ui) {   
			location.href = ui.item.url;
		}
	});

	$('body').on('click','[data-list-action]', function() {
		var quantity = $(this).attr('data-quantity');
		if (!quantity) quantity = $('#'+$(this).data('quantity-sel')).val();

		var item_id = $(this).attr('data-item-id');
		var subitem_id = $(this).attr('data-subitem-id');
		var action = $(this).attr('data-list-action');
		var list = $(this).attr('data-list') || 'cart';
		
		var remove_item = $(this).attr('data-remove-item');
		if (remove_item) $(remove_item).remove();
		/*if (list == 'cart') {
			var product = {
				name: $(this).attr('data-title') || '',
				price: $(this).attr('data-price') || '',
				category: $(this).attr('data-category') || '',
				quantity: quantity
			}
		}*/

		$('#'+list).load('/', {
			comp: 'list_server',
			list: list,
			action: action,
			item_id: item_id,
			subitem_id: subitem_id,
			quantity: quantity,
			onlycount: true
		}, function() {
			$(this).parent()[action == 'add' ? 'addClass' : 'removeClass']('exists_in_list');
			$(this).parent().parent().find('.cart-ed').hide();

			if (list == 'cart' && action == 'add') {
				$('#modal').load('/', {
					comp: 'list_server',
					list: 'cart',
					onlycount: 0
				}, function() {
					if ($('#modal').html().length) {
						$('#modal').modal('show');
					}
				});
			}
		}.bind(this));


		return false;
	});

	catalogOnReady();
});


function recalcCart() {
	var arr = {};
	$('[data-cart-quantity]').each(function() {
		arr[$(this).data('cart-quantity')] = $(this).val();
	});
	$.getJSON('/', {
		comp: 'cart',
		action: 'xhr_recalcCart',
		data: arr
	}, function(data) {
		$('#cart').load('/', {
			comp: 'list_server',
			list: 'cart'
		});

		if (data.total_cost == 0) location.reload();

		if (data.items.length) data.items.forEach(function(item) {
			$('#discount_percent_'+item.id).text(item.discount_percent);
			if (item.discount_percent > 0) {
				$('#discount_percent_'+item.id).parent().removeClass('d-none');
			} else {
				$('#discount_percent_'+item.id).parent().addClass('d-none');
			}

			$('#promo_discount_'+item.id).text(item.promo_discount);
			if (item.promo_discount > 0) {
				$('#non_discountable_'+item.id).parent().addClass('d-none');
				$('#promo_discount_'+item.id).parent().removeClass('d-none');
			} else {
				$('#non_discountable_'+item.id).parent().removeClass('d-none');
				$('#promo_discount_'+item.id).parent().addClass('d-none');
			}

			$('#false_price_'+item.id).text(moneyFormat(item.false_price));
			if (item.false_price > 0) {
				$('#false_price_'+item.id).parent().removeClass('d-none');
			} else {
				$('#false_price_'+item.id).parent().addClass('d-none');
			}

			$('#price_'+item.id).text(moneyFormat(item.price));
		});

		var total_sum = parseFloat(data.total_cost)-parseFloat(data.total_discount);

		$('[data-cart-discount]').html(moneyFormat(data.total_discount));
		if (data.total_discount > 0) {
			$('[data-cart-discount]').closest('tr').removeClass('d-none');
		} else {
			$('[data-cart-discount]').closest('tr').addClass('d-none');
		}

		$('[data-assembly-sum]').html(moneyFormat(data.total_assembly));
		$('#assembly_box')[data.total_assembly > 0 ? 'removeClass' : 'addClass']('d-none');

		$('[data-cart-totalsum]').html(moneyFormat(total_sum));
		$('[data-cart-sum]').html(moneyFormat(data.total_cost));
		$('[data-vat-sum]').html(moneyFormat(total_sum*data.vat/100));
		if (data.total_cost < data.min_order_sum)
			$('[data-cart-order]').addClass('disabled');
		else
			$('[data-cart-order]').removeClass('disabled');
		if (data.total_bonus_gain)
			$('[data-cart-bonuses-block]').show();
		else
			$('[data-cart-bonuses-block]').hide();
		$('[data-cart-bonuses-amount]').html(data.total_bonus_gain);
		
		data.items.forEach(function(item){
			$('[data-cart-total="'+item.id+'"]').html(moneyFormat(parseFloat(item.price)*parseFloat(item.quantity)));
		});

		if (data.next_group && parseInt(data.next_group.need_more) > 0) {
			$('#next_group .ng_need_more').text(moneyFormat(data.next_group.need_more));
			$('#next_group .ng_discount').text(data.next_group.discount);
			$('#next_group').removeClass('d-none');
		} else {
			$('#next_group').addClass('d-none');
		}

		if (data.promo) {
			$('#promocode_caption').removeClass('d-none');
			$('#promocode_caption').html(data.promo.caption);
		} else {
			$('#promocode_caption').addClass('d-none');
		}



		$(window).trigger('scroll');
	});
}

function catalogOnReady()
{		
	if ($('#select_variants option').length) {
		$('#select_variants').on('change', function() {
			var $option = $(this).find('option:selected'),
				subitem_id = $option.data('subitem-id'),
				subitem_price = $option.data('subitem-price'),
				bonus_gain = $option.data('subitem-bonus_gain');

			$('#price').text(subitem_price);

			$('.buy_buttons').hide();
			$('.buy_buttons_'+ subitem_id).show();

			$('.oneclick_buttons').hide();
			$('.oneclick_buttons_'+ subitem_id).show();
		});

		$('#select_variants').trigger('change');
	}


	if ($('.select_variants option').length) {

		$('.select_variants').on('change', function() {
			var vart = $(this).data('vart').replace(' ', ''),
				$option = $(this).find('option:selected'),
				item_id = $(this).data('itemid'),
				subitem_id = $option.data('subitem-id'),
				subitem_price = $option.data('subitem-price'),
				bonus_gain = $option.data('subitem-bonus_gain');
				
			$('.price_'+vart+'_'+item_id).text(subitem_price).append('. -');

			$('.buy_buttons_'+vart+'_'+item_id).hide();

			var $subitem = $('.buy_buttons_'+vart+'_'+item_id+'_'+subitem_id);
			$subitem.show();

			if ($subitem.hasClass('exists_in_list')) {				
				$subitem.parent().find('.cart-ed').hide();
			} else {
				$subitem.parent().find('.cart-ed').show();
			}
		});

		$('.select_variants').trigger('change');
	}

	$('.exists_in_list').each(function() {
		if (!$(this).parent().parent().find('.select_variants').length)
			$(this).parent().find('.cart-ed').hide();
	})
}

function auth(formselector) {
	$(formselector).find('.auth_button')
		.after($('<div>').append(
			$('<div>').addClass('spinner-border spinner-border-sm mr-2')
		).append(
			$('<span>', {text: 'Пожалуйста, подождите ...'})
		))
		.remove();

	$(formselector).submit();
}

function reg(selector) {
	$(selector).find('.reg_button')
		.after($('<div>').append(
			$('<div>').addClass('spinner-border spinner-border-sm mr-2')
		).append(
			$('<span>', {text: 'Пожалуйста, подождите ...'})
		))
		.remove();

	var data = {
		comp: 'auth',
		mode: 'reg',
		action: 'reg',
		template: $(selector+' .template').val(),
		data: {
			userid: '',
			email: $(selector+' .email').val(),
			password: $(selector+' .password').val(),
			password_repeat: $(selector+' .password_repeat').val()
		}
	}
	$(selector).load('/', data);
}

function sendForm(selector) {
	var form = $(selector+' form');
	var data = form.serializeArray();
	$(selector).load('/', data);
}


jQuery.extend({
	unparam: function(params) {
		var objResult = {};
		$.each(params.split("&"), function(){
			var prm=this.split("=");
			objResult[prm[0]] = prm[1];
		});
		return objResult;
	}
});

function addBookmark() {
    if (document.all) window.external.addFavorite('', ' ');
};

function addToCart(item_id) {
	$('#cart_info').load('/',{
		comp: 'cart',
		act: 'addToCart',
		item_id: item_id
	});
};

function setSort(value, reload) {
	$.cookie('sortby', value, {expires: 180, path: '/'});
	if (reload) location.reload();
}

function setFilter(name, value) {
	var filter = $.cookie('filterby');
	filter = filter ? $.unparam(filter) : {};
	
	if (value) {
		filter[name] = value;
	} else {
		delete(filter[name]);
	}

	$.cookie('filterby', decodeURIComponent($.param(filter)), {expires: 180, path: '/'});
	location.reload();
}

function loadmore(button_wrapper_id, items_container_id, data_encoded, callback) {
	var data = JSON.parse(data_encoded);
	data.comp = 'catblock';

	if (!data.page) data.page = 1;
	data.page++;

	$.ajax({
		url: '/',
		type: 'post',
		data: data,
		dataType: 'text',
		beforeSend: function() {
			$(button_wrapper_id).empty().text('Загружается ...');
		},
		success: function(content) {
			var $content = $('<div>').append(content);

			$(button_wrapper_id).empty().append(
				$content.find(button_wrapper_id).html()
			);

			$(items_container_id).append(
				$content.find(items_container_id).html()
			);

			$(window).trigger('resize');

			if (typeof callback == 'function') callback();
		}
	});
}

function is_touch_device() {
	var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
	var mq = function(query) {
	return window.matchMedia(query).matches;
	}

	if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
	return true;
	}

	// include the 'heartz' as a way to have a non matching MQ to help terminate the join
	// https://git.io/vznFH
	var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
	return mq(query);
}

function alert(string, title) {
	 title = 'Уведомление от сайта' || false;
	$('#imodal .modal-title').html(title);
	$('#imodal .modal-body').html(string);
	$('#imodal').modal('show');
}