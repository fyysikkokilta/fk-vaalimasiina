const messages = {
  Info: {
    title: 'Tervetuloa vaalimasiinaan!',
    info: 'Tämä on vaalimasiinan etusivu! Saat sähköpostitse uniikin äänestyslinkin, kun äänestys alkaa.',
    info_2:
      'Vain killan varsinaiset jäsenet saavat äänestää. Poistu kokouksesta, jos et ole varsinainen jäsen. Jos olet saanut äänestyslinkin, mutta et ole varsinainen jäsen, ilmoita asiasta puheenjohtajalle tai sihteerille välittömästi.',
    info_3: 'Jos sinulla on kysyttävää tai ongelmia, ota yhteyttä puheenjohtajaan tai sihteeriin.'
  },
  NotFound: {
    title: 'Etsimääsi sivua ei löytynyt',
    description:
      'Tarkista, että olet käyttänyt oikeaa linkkiä ja yritä uudelleen. Jos ongelma toistuu, ota yhteyttä puheenjohtajaan tai sihteeriin.',
    back_to_frontpage: 'Takaisin etusivulle'
  },
  LoadingSpinner: {
    loading: 'Ladataan...'
  },
  ErrorBoundary: {
    title: 'Jotain meni pieleen',
    message:
      'Lataa sivu uudelleen ja kokeile uudelleen. Jos ongelma toistuu, ota yhteyttä puheenjohtajaan tai sihteeriin.',
    error_message: 'Virheviesti',
    back_to_frontpage: 'Takaisin etusivulle',
    reload: 'Lataa uudelleen'
  },
  VoterNotFound: {
    title: 'Äänestyslinkkiä ei löytynyt',
    description:
      'Äänestyslinkkiä ei löytynyt. Tarkista, että olet käyttänyt oikeaa linkkiä ja yritä uudelleen. Jos ongelma toistuu, ota yhteyttä puheenjohtajaan tai sihteeriin.',
    back_to_frontpage: 'Takaisin etusivulle'
  },
  Vote: {
    title: 'Äänestäminen',
    election_not_ongoing: 'Tämän äänestyslinkin äänestys ei ole käynnissä',
    election_not_ongoing_description:
      'Tämän äänestyslinkin äänestys ei ole käynnissä. Äänestys on todennäköisesti loppunut jo. Jos tämä on mielestäsi virhe, ota yhteyttä puheenjohtajaan tai sihteeriin.',
    to_choose: 'Tässä äänestyksessä valitaan {seats, plural, =1 {1 ehdokas} other {# ehdokasta}}',
    vote_instruction:
      'Raahaa haluamasi ehdokkaat Äänestyslippusi-laatikkoon ja järjestä ne ylhäältä alas haluamaasi järjestykseen. Ehdokkaita voi siirtää myös tuplaklikkaamalla. Voit äänestää niin monta ehdokasta kuin haluat tai jättää tyhjän äänen.',
    available_candidates: 'Ehdokkaat',
    your_ballot: 'Äänestyslippusi',
    submit_vote: 'Äänestä',
    thanks_for_voting: 'Kiitos äänestämisestä!',
    already_voted: 'Olet jo äänestänyt!',
    back_to_frontpage: 'Takaisin etusivulle',
    audit_info:
      'Painamalla alla olevaa nappia voit kopioida äänestyslippusi tunnisteen. Voit tarkastaa, että äänestyslippusi on oikein ja otettu huomioon tuloksessa tarkastusnäkymässä, kun äänestys on päättynyt. Ota tunniste talteen, sillä et voi saada sitä enää myöhemmin uudelleen.',
    audit_button: 'Kopioi äänestyslipun tunniste',
    audit_copied_to_clipboard: 'Äänestyslipun tunniste kopioitu leikepöydälle',
    confirm_vote: 'Äänen vahvistus',
    confirm_vote_description:
      'Tarkasta äänestyslippusi ja paina vahvista ääni -nappia vahvistaaksesi äänesi. Ääntä ei voi enää muuttaa vahvistuksen jälkeen.',
    empty_ballot: 'Tyhjä äänestyslippu',
    cancel: 'Peruuta',
    confirm: 'Vahvista',
    invalid_ballot: 'Virheellinen äänestyslippu',
    validation: {
      voterId_uuid: 'Äänestäjätunnisteen tulee olla kelvollinen UUID',
      candidateId_uuid: 'Ehdokastunnisteen tulee olla kelvollinen UUID',
      rank_number: 'Sijoituksen tulee olla numero',
      rank_min: 'Sijoituksen tulee olla vähintään 1',
      ballot_array: 'Äänestyslipun tulee olla taulukko',
      ranks_unique: 'Sijoitusten tulee olla uniikkeja'
    }
  },
  Login: {
    title: 'Hallintaan kirjautuminen',
    signin_description: 'Kirjaudu sisään tililläsi päästäksesi ylläpitopaneeliin.',
    signin_with: 'Kirjaudu {provider}',
    signin_with_google: 'Kirjaudu Google',
    no_providers_configured:
      'OAuth-palveluntarjoajia ei ole määritelty. Ota yhteyttä ylläpitäjään.',
    error_access_denied: 'Pääsy evätty. Yritä uudelleen.',
    error_unauthorized: 'Sinulla ei ole oikeutta käyttää tätä sovellusta.',
    error_server_error: 'Palvelinvirhe. Yritä myöhemmin uudelleen.',
    error_no_code: 'Virheellinen valtuutuskoodi. Yritä uudelleen.'
  },
  ElectionList: {
    title: 'Tulokset',
    no_previous_results: 'Ei aiempia tuloksia',
    no_previous_results_description:
      'Tähän mennessä ei ole vielä järjestetty vaaleja tai niiden tuloksia ei ole julkaistu.',
    pagination: {
      previous: 'Edellinen',
      next: 'Seuraava',
      page: 'Sivu'
    }
  },
  Election: {
    title: 'Tulokset',
    back_to_list: 'Takaisin listaukseen'
  },
  ElectionNotFound: {
    title: 'Vaalia ei löytynyt',
    description:
      'Vaalia ei löytynyt. Tarkista, että olet käyttänyt oikeaa linkkiä ja yritä uudelleen. Jos ongelma toistuu, ota yhteyttä puheenjohtajaan tai sihteeriin.',
    back_to_frontpage: 'Takaisin etusivulle'
  },
  Audit: {
    title: 'Auditointi',
    ballot_id: 'Äänestyslipun tunniste',
    ballot: 'Äänestyslippu',
    no_finished_election: 'Ei päättynyttä vaalia',
    no_finished_election_description:
      'Voit tarkastella vain juuri päättynyttä vaalia. Jos tämä on mielestäsi virhe, ota yhteyttä puheenjohtajaan tai sihteeriin.',
    empty_ballot: 'Tyhjä äänestyslippu',
    search_ballot: 'Hae äänestyslippua',
    placeholder_no_id: 'Syötä äänestyslipun tunniste nähdäksesi äänestyslipun',
    placeholder_incorrect_id: 'Tunnistetta vastaavaa äänestyslippua ei löytynyt'
  },
  Admin: {
    title: 'Hallinta'
  },
  VotingInspection: {
    given_votes: 'Annettuja ääniä',
    voters: 'Äänestäjiä',
    old_email: 'Vaihdettava sähköposti',
    new_email: 'Uusi sähköposti',
    change_email: 'Vaihda sähköposti',
    show_remaining_voters: 'Näytä jäljellä olevat äänestäjät',
    hide_remaining_voters: 'Piilota jäljellä olevat äänestäjät',
    remaining_voters_empty: 'Kaikki ovat äänestäneet',
    validation: {
      oldEmail_email: 'Vaihdettavan sähköpostin tulee olla kelvollinen sähköpostiosoite',
      newEmail_email: 'Uuden sähköpostin tulee olla kelvollinen sähköpostiosoite'
    }
  },
  PreviewElection: {
    seats: 'Paikkoja',
    candidates: 'Ehdokkaat',
    voters: 'Äänestäjät',
    email_list_instruction: 'Lisää tähän äänestäjien sähköpostiosoitteet rivinvaihdolla erotettuna',
    email_list_placeholder: 'sähköposti@mail.com\nsähköposti2@mail.com\n',
    voter_count: 'Äänestäjien määrä',
    invalid_voter_data: 'Virheelliset äänestäjätiedot',
    validation: {
      email_email: 'Sähköpostiosoitteen tulee olla kelvollinen sähköpostiosoite',
      emails_array: 'Sähköpostiosoitteiden tulee olla taulukko',
      emails_nonempty: 'Sähköpostiosoitteita tulee olla vähintään yksi',
      emails_unique: 'Sähköpostiosoitteiden tulee olla uniikkeja'
    }
  },
  NewElection: {
    invalid_election_data: 'Virheelliset vaalitiedot'
  },
  EditElection: {
    invalid_election_data: 'Virheelliset vaalitiedot'
  },
  LanguageSwitcher: {
    other_language: 'In English'
  },
  Header: {
    main: 'Etusivu',
    audit: 'Auditointi',
    previous_results: 'Tulokset',
    admin: 'Hallinta'
  },
  ElectionResults: {
    initial_votes: 'Alkuperäiset äänet',
    total_votes: 'Ääniä',
    non_empty_votes: 'Epätyhjiä ääniä',
    seats: 'Paikkoja',
    quota: 'Äänikynnys',
    candidate_name: 'Ehdokas',
    round: 'Kierros',
    result: 'Tulos',
    empty_votes: 'Tyhjiä',
    chosen_before: 'Valittu',
    eliminated_before: 'Putosi',
    previous_round: 'Edellinen',
    next_round: 'Seuraava',
    export_csv: 'Lataa äänestysliput CSV-tiedostona',
    export_minutes: 'Kopioi tulokset leikepöydälle',
    minutes_copied_to_clipboard: 'Tulokset kopioitu leikepöydälle',
    voter_count: 'Äänestäjiä',
    invalid_result: 'Ei-vaalikelpoinen tulos. Äänestys uusitaan.'
  },
  ElectionForm: {
    election_title: 'Otsikko',
    description: 'Kuvaus',
    seats: 'Paikkoja',
    new_candidate: 'Uusi ehdokas',
    add_candidate: 'Lisää ehdokas',
    remove_candidate: 'Poista ehdokas',
    candidates: 'Ehdokkaat',
    validation: {
      title_string: 'Otsikon tulee olla merkkijono',
      title_nonempty: 'Otsikko ei saa olla tyhjä',
      description_string: 'Kuvauksen tulee olla merkkijono',
      description_nonempty: 'Kuvaus ei saa olla tyhjä',
      seats_number: 'Paikkamäärän tulee olla numero',
      seats_min: 'Paikkamäärän tulee olla vähintään 1',
      candidate_string: 'Ehdokkaan tulee olla merkkijono',
      candidate_nonempty: 'Ehdokas ei saa olla tyhjä',
      candidates_array: 'Ehdokkaiden tulee olla taulukko',
      candidates_nonempty: 'Ehdokkaita tulee olla vähintään yksi',
      candidates_geq_seats:
        'Ehdokkaiden määrän tulee olla vähintään yhtä suuri kuin paikkojen määrä',
      electionId_uuid: 'Vaalitunnisteen tulee olla kelvollinen UUID'
    }
  },
  metadata: {
    title: 'Vaalimasiina',
    description: 'Fyysikkokillan sähköinen äänestysjärjestelmä',
    vote: {
      title: 'Äänestäminen',
      description: 'Äänestä vaaleissa'
    },
    login: {
      title: 'Kirjautuminen',
      description: 'Kirjaudu hallintapaneeliin'
    },
    elections: {
      title: 'Tulokset',
      description: 'Katso aiempien vaalien tulokset'
    },
    election: {
      title: '{title}',
      description: 'Katso vaalin {title} tulokset'
    },
    audit: {
      title: 'Auditointi',
      description: 'Tarkasta vaalia {title}',
      description_no_election: 'Tarkasta vaalia'
    },
    admin: {
      title: 'Hallinta',
      description: 'Hallinnoi vaaleja'
    }
  }
} as const

export default messages
