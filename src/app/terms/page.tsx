import React from 'react';

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">利用規約</h1>
      
      <div className="prose prose-gray max-w-none">
        <p className="mb-4">この利用規約（以下、「本規約」といいます。）は、本サービス（本サイトを含むものとし、以下、特に両者を区別しません。）の利用条件を定めるものです。</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">第1条（適用）</h2>
          <p>本規約は、ユーザーと本サービス運営者（以下、「当方」といいます。）との間の本サービスの利用に関わる一切の関係に適用されるものとします。</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">第2条（利用登録）</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>登録希望者が当方の定める方法によって利用登録を申請し、当方がこれを承認することによって、利用登録が完了するものとします。</li>
            <li>当方は、利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあり、その理由については一切の開示義務を負わないものとします。
              <ul className="list-disc list-inside ml-4 mt-2">
                <li>利用登録の申請に際して虚偽の事項を届け出た場合</li>
                <li>本規約に違反したことがある者からの申請である場合</li>
                <li>未成年者、成年被後見人、被保佐人または被補助人のいずれかであり、法定代理人、後見人、保佐人または補助人の同意等を得ていなかった場合</li>
                <li>その他、当方が利用登録を相当でないと判断した場合</li>
              </ul>
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">第3条（ユーザーIDおよびパスワードの管理）</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>ユーザーは、自己の責任において、本サービスのユーザーIDおよびパスワードを適切に管理するものとします。</li>
            <li>ユーザーは、いかなる場合にも、ユーザーIDおよびパスワードを第三者に譲渡または貸与し、もしくは第三者と共用することはできません。</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">第4条（利用料金）</h2>
          <p>本サービスの利用は無料とします。ただし、将来的に有料サービスを追加する場合は、事前に通知の上、ユーザーの同意を得るものとします。</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">第5条（禁止事項）</h2>
          <p>ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
          <ol className="list-decimal list-inside space-y-2 mt-2">
            <li>法令または公序良俗に違反する行為</li>
            <li>犯罪行為に関連する行為</li>
            <li>当方のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
            <li>当方のサービスの運営を妨害するおそれのある行為</li>
            <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
            <li>他のユーザーに成りすます行為</li>
            <li>当方のサービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為</li>
            <li>その他、当方が不適切と判断する行為</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">第6条（本サービスの提供の停止等）</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>当方は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
              <ul className="list-disc list-inside ml-4 mt-2">
                <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
                <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
                <li>コンピュータまたは通信回線等が事故により停止した場合</li>
                <li>その他、当方が本サービスの提供が困難と判断した場合</li>
              </ul>
            </li>
            <li>当方は、本サービスの提供の停止または中断により、ユーザーまたは第三者が被ったいかなる不利益または損害についても、一切の責任を負わないものとします。</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">第7条（著作権）</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>ユーザーは、自ら著作権等の必要な知的財産権を有するか、または必要な権利者の許諾を得た文章、画像や映像等の情報のみ、本サービスを利用し、投稿または編集することができるものとします。</li>
            <li>ユーザーが本サービスを利用して投稿または編集した文章、画像、映像等の著作権については、当該ユーザーその他既存の権利者に留保されるものとします。</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">第8条（利用制限および登録抹消）</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>当方は、以下の場合には、事前の通知なく、ユーザーに対して、本サービスの全部もしくは一部の利用を制限し、またはユーザーとしての登録を抹消することができるものとします。
              <ul className="list-disc list-inside ml-4 mt-2">
                <li>本規約のいずれかの条項に違反した場合</li>
                <li>登録事項に虚偽の事実があることが判明した場合</li>
                <li>その他、当方が本サービスの利用を適当でないと判断した場合</li>
              </ul>
            </li>
            <li>当方は、本条に基づき当方が行った行為によりユーザーに生じた損害について、一切の責任を負いません。</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">第9条（免責事項）</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>当方の債務不履行責任は、当方の故意または重過失によらない場合には免責されるものとします。</li>
            <li>当方は、何らかの理由によって責任を負う場合にも、通常生じうる損害の範囲内かつ有料サービスにおいては代金額（継続的サービスの場合には1か月分相当額）の範囲内においてのみ賠償の責任を負うものとします。</li>
            <li>当方は、本サービスに関して、ユーザーと他のユーザーまたは第三者との間において生じた取引、連絡または紛争等について一切責任を負いません。</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">第10条（サービス内容の変更等）</h2>
          <p>当方は、ユーザーに通知することなく、本サービスの内容を変更しまたは本サービスの提供を中止することができるものとし、これによってユーザーに生じた損害について一切の責任を負いません。</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">第11条（利用規約の変更）</h2>
          <p>当方は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。なお、本規約の変更後、本サービスの利用を開始した場合には、当該ユーザーは変更後の規約に同意したものとみなします。</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">第12条（個人情報の取扱い）</h2>
          <p>当方は、本サービスの利用によって取得する個人情報については、当方「プライバシーポリシー」に従い適切に取り扱うものとします。</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">第13条（通知または連絡）</h2>
          <p>ユーザーと当方との間の通知または連絡は、当方の定める方法によって行うものとします。</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">第14条（権利義務の譲渡の禁止）</h2>
          <p>ユーザーは、当方の書面による事前の承諾なく、利用契約上の地位または本規約に基づく権利もしくは義務を第三者に譲渡し、または担保に供することはできません。</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">第15条（準拠法・裁判管轄）</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>本規約の解釈にあたっては、日本法を準拠法とします。</li>
            <li>本サービスに関して紛争が生じた場合には、当方の本店所在地を管轄する裁判所を専属的合意管轄とします。</li>
          </ol>
        </section>

        <p className="mt-8 text-right">以上</p>
        <p className="mt-4 text-right">制定日：2025年1月13日</p>
      </div>
    </div>
  );
}