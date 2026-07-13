import { addPage, NamedPage, Socket } from '@hydrooj/ui-default';
import Swal from 'sweetalert2';

addPage(new NamedPage('record_detail', async () => {
    let imageUrl = '/ac-default.webp';
    if (UiContext.acImgUrl) imageUrl = UiContext.acImgUrl;
    const showCongrats = (result, firstAC) => Swal.fire({
            html: `
                <div style="position: relative; width: 500px; margin: 0 auto;">
    
                    <!-- 主图 -->
                    <img src="${imageUrl}" 
                        style="width: 100%; display: block; border-radius: 12px;" />
    
                    <!-- 覆盖层 -->
                    <div style="
                        position: absolute;
                        top: 30%;
                        left: 50%;
                        transform: translateX(-50%);
                        background: rgba(0, 0, 0, 0.25);
                        padding: 10px 16px;
                        border-radius: 12px;
                        color: #fff;
                        white-space: nowrap;
                        pointer-events: none;
                    "><p style="font-size: 36px;">🎉 恭喜 AC</p>
                      ${firstAC ? `<p style="font-size: 18px;">获得金币🪙${firstAC} 枚</p>` : ''}
                    </div>
                    <div style="
                        position: absolute;
                        top: 60%;
                        left: 50%;
                        transform: translateX(-50%);
                        background: rgba(0, 0, 0, 0.25);
                        padding: 10px 16px;
                        border-radius: 12px;
                        color: #fff;
                        font-size: 14px;
                        white-space: nowrap;
                        pointer-events: none;
                    ">
                        <b>峰值时间：${result['峰值时间']}</b>
                        &nbsp;&nbsp;
                        <b>峰值内存：${result['峰值内存']}</b>
                    </div>
    
                </div>
            `,
            showConfirmButton: true,
            confirmButtonText: '不愧是我',
            confirmButtonColor: '#3dc7b4',
            background: 'transparent',
            width: 'auto'
        });
    if (!UiContext.socketUrl || !UiContext.rdoc) return;
    const rdoc = UiContext.rdoc;
    const sock = new Socket(UiContext.ws_prefix + UiContext.socketUrl, false, true);

    sock.onmessage = (_, data) => {
        const msg = JSON.parse(data);
        const params = new URLSearchParams(UiContext.socketUrl.split('?')[1]);
        const domainId = params.get('domainId');
        const rid = params.get('rid');

        if (rdoc.contest && rdoc.contest.toString() === '000000000000000000000000') return;
        if (msg.status === 1 && msg.status !== rdoc.status && rdoc.uid === UserContext._id) {

            const html = msg.summary_html;

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const dts = doc.querySelectorAll('dt');
            const dds = doc.querySelectorAll('dd');

            const result = {};
            dts.forEach((dt, i) => {
                result[dt.textContent.trim()] = dds[i]?.textContent.trim();
            });

            checkFirstACAndShow(rdoc.uid, domainId + rdoc.pid + '-' + rid).then(firstAC => {
                showCongrats(result, firstAC);
            });
        }
    };

    async function checkFirstACAndShow(uid, goodsId) {
        const response = await fetch(`/check-first?uid=${uid}&goodsId=${goodsId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const data = await response.json();
        if (data.success) {
            return data.reward;
        }
    }
}));