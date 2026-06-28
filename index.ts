import { Context, db } from 'hydrooj';

export function apply(ctx: Context) {
    ctx.on('handler/after/RecordDetail#get', async (that) => {
        const userAcImg = await db.collection('bag').findOne({uid: that.rdoc.uid, type: 6, loaded: true});
        
        if (userAcImg) {
            const img = await db.collection('goods').findOne({_id: userAcImg.goodsId});
                if (img) {
                that.UiContext.acImgUrl = img.imageUrl;
            }
        }
        
        that.UiContext.rdoc = that.response.body.rdoc;
    });
    ctx.on('handler/after/ProblemDetail#get', async (that) => {
        const userAcImg = await db.collection('bag').findOne({uid: that.udoc._id, type: 6, loaded: true});

        if (userAcImg) {
            const img = await db.collection('goods').findOne({_id: userAcImg.goodsId});
                if (img) {
                that.UiContext.acImgUrl = img.imageUrl;
            }
        }
    });
}