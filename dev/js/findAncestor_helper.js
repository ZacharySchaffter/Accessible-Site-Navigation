function findAncestor (el, elType, cls) {
        while ((el = el.parentNode)) {
        	if (!el || !el.tagName){
          	return null;
          }
      
          if ((!elType || elType == el.tagName.toLowerCase()) && (!cls || el.className.indexOf(cls) >= 0))	{
            return el;
          } 
        }   
    }