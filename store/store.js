var store = {
    debug: true,
    state: (function(){
        if(localStorage.getItem('state')){
            try{
                return JSON.parse(localStorage.getItem('state'));
            }catch(e){
                localStorage.removeItem('state');
            }
        }

        return config;
    })(),
    addItem: function(parentId, value, type){
        console.log('addItem');
        //get parent item
        var parentItem = this.queryItem(parentId);
        //generate item id
        id = this.generateId(parentItem);

        if(parentItem.type != '0'){
            return parentId;
        }
        //compute parent child num
        parentItem.children.push({
            id: id,
            order: this.queryChild(parentId).length - 1,
        });

        parentItem.child ++;

        this.state.dataStore[id] = {
            id: id,
            parentId: parentId,
            type: type,
            value: value,
            child: 0,
            valid: '1',
            order: parentItem.children.length - 1,
            children: [],
        };

        this.state.dataStore = Object.assign({}, this.state.dataStore);

        return id;
    },
    updateItem: function(id, value, type, url){
        console.log('updateItem');
        //get item
        var item = this.queryItem(id);

        item.value = value;
        item.type = type;
        item.url = url;
    },
    deleteItem: function(id){
        console.log('deleteItem');

        var item = this.queryItem(id);
        item.valid = '0';

        return id;
    },
    queryItem: function(id){
        return this.state.dataStore[id];
    },
    queryChild: function(id){
        var children = this.state.dataStore[id].children.sort(function(a, b){
            return a.order - b.order;
        });

        for(var index in children){
            children[index].order = parseInt(index);
        }

        this.state.dataStore[id].children = children;

        return this.state.dataStore[id].children;
    },
    setCurrent: function(id){
        this.state.currentId = id;
    },
    generateId: function(parentItem){
        return 'I'+Date.parse(new Date());
    },
};