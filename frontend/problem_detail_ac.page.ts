import { addPage, NamedPage, Socket } from '@hydrooj/ui-default';
import Swal from 'sweetalert2';

addPage(new NamedPage(['problem_detail', 'homework_detail_problem', 'contest_detail_problem'], async () => {
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

    const prevStatus = new Map();
    const sock = new Socket(UiContext.ws_prefix + UiContext.pretestConnUrl);
    sock.onmessage = (message) => {
        if (message.data === 'ping') return;
        const msg = JSON.parse(message.data);
        const rdoc = msg.rdoc;
        const domainId = rdoc.domainId;
        const rid = rdoc._id.toString();
        const prev = prevStatus.get(rid);

        if (rdoc.contest && rdoc.contest.toString() === '000000000000000000000000') return;
        if (rdoc.status === 1 && prev !== 1 && rdoc.uid === UserContext._id) {
            const result = {};
            result['峰值时间'] = (rdoc.time).toFixed(0) + ' ms';
            if (rdoc.memory < 1024) {
                result['峰值内存'] = (rdoc.memory).toFixed(2) + ' KiB';
            }
            else {
                result['峰值内存'] = (rdoc.memory / 1024).toFixed(2) + ' MiB';
            }

            checkFirstACAndShow(rdoc.uid, domainId + rdoc.pid + '-' + rid).then(firstAC => {
                showCongrats(result, firstAC);
            });

            prevStatus.set(rid, rdoc.status);
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