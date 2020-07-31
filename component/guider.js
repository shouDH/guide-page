Vue.component('guider', {
    template:  `<div class="guider" :style="style">
                    <guide-control>
                        <guide-tree item-id="root" ref="Box" :indent="0" style="height:60%;overflow-y:scroll"></guide-tree>
                    </guide-control>
                </div>`,
    mounted () {
        document.addEventListener('scroll',this.scrollHandler, true);
    },
    data: function(){
        return {
            style: {
                width: '100%',
                height: '100%',
                backgroundImage: 'url(image/background.jpg)',
            },
        };
    },
    methods: {
        scrollHandler: function(e){
            dragStore.clickState.scrollTop = this.$refs.Box.$el.scrollTop;
        }
    }
})