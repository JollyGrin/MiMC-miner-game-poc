<div class="grid h-screen place-items-center p-4">
	<div
		class="grid h-full max-h-[20rem] w-full max-w-[50rem] bg-orange-300 p-4 font-mono text-gray-500"
	>
		<div class="flex flex-col">
			<p>Network Scraper CLI</p>
			<p class="text-orange-200">
				{Array.from({ length: 40 })
					.map(() => '/')
					.toString()
					.replaceAll(',', '')}
			</p>
			<p>Scrape social networks to find contacts that match specified criteria.</p>
			<p>Once you have contacts, reach out via signed messages to recruit.</p>
		</div>
		<div class="flex gap-4">
			<div>
				<p>Contacts found: 0</p>
				<p>Pending invites sent: 0</p>
			</div>
			<div>
				<p>Recruits joined: 0</p>
				<p>Recruits available: 0/0</p>
			</div>
		</div>
		<div class="flex gap-4">
			<button class="h-fit w-fit self-end rounded bg-orange-200 p-3">{'> Start Scraping'}</button>
			<button class="h-fit w-fit cursor-not-allowed self-end rounded bg-orange-200 p-3 opacity-40">
				{'> Send invites'}
			</button>

			<button class="h-fit w-fit cursor-not-allowed self-end rounded bg-orange-200 p-3 opacity-40">
				{'> Send onto missions'}
			</button>
		</div>
	</div>
</div>
